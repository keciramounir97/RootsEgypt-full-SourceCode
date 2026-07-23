const DEFAULT_TAGLINES = {
  basic: "Get started with basic family tree features",
  premium: "Unlock advanced genealogy tools and archives",
  pro: "Full access to all features, AI tools, and priority support",
};

const DEFAULT_FEATURES = {
  basic: [
    "Build up to 3 family trees",
    "Basic tree visualization",
    "Add up to 50 people per tree",
    "Community access",
    "Email support",
  ],
  premium: [
    "Unlimited family trees",
    "Advanced tree visualization",
    "Unlimited people per tree",
    "Archive document uploads",
    "GEDCOM import/export",
    "Priority email support",
    "Advanced search & filters",
  ],
  pro: [
    "Everything in Premium",
    "AI-powered tree suggestions",
    "AI note summarization",
    "Task management & reminders",
    "WhatsApp priority support",
    "Early access to new features",
    "Contribute to archive database",
  ],
};

exports.up = async function (knex) {
  if (await knex.schema.hasTable("subscription_tiers")) {
    if (!(await knex.schema.hasColumn("subscription_tiers", "tagline"))) {
      await knex.schema.alterTable("subscription_tiers", (table) => {
        table.string("tagline", 255).nullable();
      });
    }
    if (!(await knex.schema.hasColumn("subscription_tiers", "description"))) {
      await knex.schema.alterTable("subscription_tiers", (table) => {
        table.text("description").nullable();
      });
    }
    if (!(await knex.schema.hasColumn("subscription_tiers", "features"))) {
      await knex.schema.alterTable("subscription_tiers", (table) => {
        table.text("features").nullable();
      });
    }
    if (!(await knex.schema.hasColumn("subscription_tiers", "is_active"))) {
      await knex.schema.alterTable("subscription_tiers", (table) => {
        table.boolean("is_active").notNullable().defaultTo(true);
      });
    }

    const tiers = await knex("subscription_tiers").select("id", "slug", "tagline", "features");
    for (const tier of tiers) {
      const updates = {};
      if (!tier.tagline && DEFAULT_TAGLINES[tier.slug]) {
        updates.tagline = DEFAULT_TAGLINES[tier.slug];
      }
      if (!tier.features && DEFAULT_FEATURES[tier.slug]) {
        updates.features = JSON.stringify(DEFAULT_FEATURES[tier.slug]);
      }
      if (Object.keys(updates).length) {
        await knex("subscription_tiers").where("id", tier.id).update(updates);
      }
    }
  }

  if (!(await knex.schema.hasTable("subscription_tier_features"))) {
    await knex.schema.createTable("subscription_tier_features", (table) => {
      table.increments("id").primary();
      table.string("feature_key", 100).notNullable();
      table.string("label", 255).notNullable();
      table
        .integer("tier_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("subscription_tiers")
        .onDelete("CASCADE");
      table.boolean("enabled").notNullable().defaultTo(false);
      table.dateTime("created_at").defaultTo(knex.fn.now());
      table.dateTime("updated_at").defaultTo(knex.fn.now());
      table.unique(["tier_id", "feature_key"]);
    });
  }

  if (await knex.schema.hasTable("subscription_tier_features")) {
    const existing = await knex("subscription_tier_features")
      .where("feature_key", "skip_download_requests")
      .first();
    if (!existing) {
      const tiers = await knex("subscription_tiers").select("id", "slug");
      const rows = tiers.map((tier) => ({
        feature_key: "skip_download_requests",
        label: "Download files without a request",
        tier_id: tier.id,
        enabled: tier.slug !== "basic",
      }));
      if (rows.length) await knex("subscription_tier_features").insert(rows);
    }
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("subscription_tier_features");
  if (await knex.schema.hasTable("subscription_tiers")) {
    await knex.schema.alterTable("subscription_tiers", (table) => {
      table.dropColumn("tagline");
      table.dropColumn("description");
      table.dropColumn("features");
      table.dropColumn("is_active");
    });
  }
};
