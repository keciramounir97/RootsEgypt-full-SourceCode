import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { UpdateTierContentDto } from './dto/subscription.dto';

type PaymentDecision = 'approved' | 'rejected';

@Injectable()
export class SubscriptionsService {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) { }

    private now() {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    private mapPayment(row: any) {
        return { ...row, amount: Number(row.amount) };
    }

    private mapTier(row: any) {
        let features: string[] = [];
        try {
            features = row.features ? JSON.parse(row.features) : [];
        } catch {
            features = [];
        }
        return {
            ...row,
            price: Number(row.price),
            is_active: Boolean(row.is_active ?? true),
            features,
        };
    }

    async listTiers() {
        const rows = await this.knex('subscription_tiers')
            .where((builder) => builder.where('is_active', true).orWhereNull('is_active'))
            .orderBy('sort', 'asc');
        return rows.map((row: any) => this.mapTier(row));
    }

    async listTiersForAdmin() {
        const rows = await this.knex('subscription_tiers').orderBy('sort', 'asc');
        return rows.map((row: any) => this.mapTier(row));
    }

    async updateTierContent(tierId: number, dto: UpdateTierContentDto, actorId: number) {
        const tier = await this.getTier(tierId);
        const update: Record<string, any> = { updated_at: this.now() };
        if (dto.name !== undefined) update.name = dto.name;
        if (dto.price !== undefined) update.price = dto.price;
        if (dto.tagline !== undefined) update.tagline = dto.tagline;
        if (dto.description !== undefined) update.description = dto.description;
        if (dto.features !== undefined) update.features = JSON.stringify(dto.features);
        if (dto.is_active !== undefined) update.is_active = dto.is_active;

        await this.knex('subscription_tiers').where('id', tier.id).update(update);
        await this.activityService.log(actorId, 'subscriptions', `Updated tier content for "${tier.name}"`);
        return this.getTier(tier.id);
    }

    async listTierFeatures() {
        const rows = await this.knex('subscription_tier_features')
            .leftJoin('subscription_tiers', 'subscription_tier_features.tier_id', 'subscription_tiers.id')
            .select(
                'subscription_tier_features.*',
                'subscription_tiers.slug as tier_slug',
                'subscription_tiers.name as tier_name',
            )
            .orderBy('subscription_tier_features.feature_key', 'asc');

        const grouped = new Map<string, any>();
        for (const row of rows) {
            const key = row.feature_key;
            if (!grouped.has(key)) {
                grouped.set(key, { featureKey: key, label: row.label, tiers: {} });
            }
            grouped.get(key).tiers[row.tier_id] = {
                enabled: Boolean(row.enabled),
                tierSlug: row.tier_slug,
                tierName: row.tier_name,
            };
        }
        return Array.from(grouped.values());
    }

    async createFeature(featureKey: string, label: string, actorId: number) {
        const key = String(featureKey || '').trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
        if (!key) throw new BadRequestException('Invalid feature key');

        const existing = await this.knex('subscription_tier_features').where('feature_key', key).first();
        if (existing) throw new BadRequestException('A feature with this key already exists');

        const tiers = await this.knex('subscription_tiers').select('id');
        if (!tiers.length) throw new BadRequestException('No subscription tiers exist yet');

        await this.knex('subscription_tier_features').insert(
            tiers.map((tier: any) => ({
                feature_key: key,
                label: String(label || key).trim(),
                tier_id: tier.id,
                enabled: false,
            })),
        );
        await this.activityService.log(actorId, 'subscriptions', `Added feature flag "${key}"`);
        return this.listTierFeatures();
    }

    async deleteFeature(featureKey: string, actorId: number) {
        await this.knex('subscription_tier_features').where('feature_key', featureKey).delete();
        await this.activityService.log(actorId, 'subscriptions', `Removed feature flag "${featureKey}"`);
        return this.listTierFeatures();
    }

    async setTierFeature(tierId: number, featureKey: string, enabled: boolean, actorId: number) {
        const row = await this.knex('subscription_tier_features')
            .where({ tier_id: tierId, feature_key: featureKey })
            .first();
        if (!row) throw new NotFoundException('Feature flag not found for this tier');

        await this.knex('subscription_tier_features')
            .where({ tier_id: tierId, feature_key: featureKey })
            .update({ enabled, updated_at: this.now() });
        await this.activityService.log(
            actorId,
            'subscriptions',
            `${enabled ? 'Enabled' : 'Disabled'} "${featureKey}" for tier #${tierId}`,
        );
        return this.listTierFeatures();
    }

    async hasFeature(userId: number | null | undefined, featureKey: string): Promise<boolean> {
        if (!userId) return false;
        const row = await this.knex('user_subscriptions')
            .where({ user_id: userId, status: 'active' })
            .orderBy('started_at', 'desc')
            .first();
        if (!row) return false;

        const flag = await this.knex('subscription_tier_features')
            .where({ tier_id: row.tier_id, feature_key: featureKey })
            .first();
        return Boolean(flag?.enabled);
    }

    private async getTier(tierId: number) {
        const tier = await this.knex('subscription_tiers').where('id', tierId).first();
        if (!tier) throw new NotFoundException('Subscription tier not found');
        return this.mapTier(tier);
    }

    private async activateSubscription(userId: number, tierId: number) {
        await this.knex('user_subscriptions')
            .where({ user_id: userId, status: 'active' })
            .update({ status: 'replaced', updated_at: this.now() });
        const [id] = await this.knex('user_subscriptions').insert({
            user_id: userId,
            tier_id: tierId,
            status: 'active',
            started_at: this.now(),
        });
        return this.knex('user_subscriptions').where('id', id).first();
    }

    async submitPayment(userId: number, data: any) {
        const tier = await this.getTier(Number(data?.tier_id));
        const amount = Number(data?.amount);
        if (!Number.isFinite(amount) || amount < 0) {
            throw new BadRequestException('Invalid amount');
        }

        // Free tiers activate immediately — no manual review needed.
        const isFree = tier.price === 0 && amount === 0;
        if (!isFree && !String(data?.proof_url || '').trim()) throw new BadRequestException('Payment proof is required');
        const [id] = await this.knex('subscription_payments').insert({
            user_id: userId,
            tier_id: tier.id,
            amount,
            proof_url: String(data?.proof_url || '').trim() || null,
            notes: String(data?.notes || '').trim() || null,
            status: isFree ? 'approved' : 'pending',
            reviewed_at: isFree ? this.now() : null,
        });
        if (isFree) await this.activateSubscription(userId, tier.id);

        const payment = await this.knex('subscription_payments').where('id', id).first();
        return { ...this.mapPayment(payment), activated: isFree };
    }

    async listSubscriptions() {
        const rows = await this.knex('user_subscriptions')
            .leftJoin('users', 'user_subscriptions.user_id', 'users.id')
            .leftJoin('subscription_tiers', 'user_subscriptions.tier_id', 'subscription_tiers.id')
            .select(
                'user_subscriptions.*',
                'users.email as user_email',
                'users.full_name as user_name',
                'subscription_tiers.name as tier_name',
                'subscription_tiers.slug as tier_slug',
            )
            .orderBy('user_subscriptions.created_at', 'desc');
        return rows;
    }

    async listPayments(status?: string) {
        const query = this.knex('subscription_payments')
            .leftJoin('users', 'subscription_payments.user_id', 'users.id')
            .leftJoin('subscription_tiers', 'subscription_payments.tier_id', 'subscription_tiers.id')
            .select(
                'subscription_payments.*',
                'users.email as user_email',
                'users.full_name as user_name',
                'subscription_tiers.name as tier_name',
            )
            .orderBy('subscription_payments.created_at', 'desc');
        const normalized = String(status || '').trim().toLowerCase();
        if (normalized && ['pending', 'approved', 'rejected'].includes(normalized)) {
            query.where('subscription_payments.status', normalized);
        }
        const rows = await query;
        return rows.map((row: any) => this.mapPayment(row));
    }

    async reviewPayment(adminId: number, id: number, decision: PaymentDecision) {
        const payment = await this.knex('subscription_payments').where('id', id).first();
        if (!payment) throw new NotFoundException('Payment not found');
        if (payment.status !== 'pending') return this.mapPayment(payment);

        await this.knex.transaction(async (trx) => {
            const locked = await trx('subscription_payments').where('id', id).forUpdate().first();
            if (!locked || locked.status !== 'pending') return;
            await trx('subscription_payments').where('id', id).update({ status: decision, reviewed_by: adminId, reviewed_at: this.now(), updated_at: this.now() });
            if (decision === 'approved') {
                await trx('user_subscriptions').where({ user_id: locked.user_id, status: 'active' }).update({ status: 'replaced', updated_at: this.now() });
                await trx('user_subscriptions').insert({ user_id: locked.user_id, tier_id: locked.tier_id, status: 'active', started_at: this.now() });
            }
        });

        await this.activityService.log(
            adminId,
            'subscriptions',
            `${decision === 'approved' ? 'Approved' : 'Rejected'} payment #${id} (user #${payment.user_id})`,
        );

        const updated = await this.knex('subscription_payments').where('id', id).first();
        return this.mapPayment(updated);
    }

    async upgradeUser(adminId: number, userId: number, tierId: number) {
        const user = await this.knex('users').where('id', userId).first();
        if (!user) throw new NotFoundException('User not found');
        const tier = await this.getTier(Number(tierId));

        const subscription = await this.activateSubscription(userId, tier.id);
        await this.activityService.log(
            adminId,
            'subscriptions',
            `Upgraded user #${userId} to tier "${tier.name}"`,
        );
        return subscription;
    }
}
