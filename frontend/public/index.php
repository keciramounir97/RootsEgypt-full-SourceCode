<?php
/**
 * Roots Maghreb - SPA Redirect
 * 
 * This file exists because Apache may try to find a PHP file.
 * Redirect to the SPA home page. The .htaccess will serve index.html
 * for the React app. Do NOT redirect to /health - that is a backend
 * API endpoint and causes 404 in the frontend.
 */
header('Location: /');
exit;
?>
