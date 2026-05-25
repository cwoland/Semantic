<template>
  <div class="not-found">
    <span class="not-found__code">404</span>
    <h1>Page not found</h1>
    <p class="text-muted">This scene doesn't exist in the script.</p>
    <RouterLink :to="{ name: 'dashboard' }" class="back-link">
      <i class="ti ti-arrow-left" /> Back to dashboard
    </RouterLink>
  </div>
</template>
<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--space-4);
  text-align: center;
  padding: var(--space-8);
}
.not-found__code {
  font-size: 96px;
  font-weight: var(--weight-medium);
  color: var(--color-border-strong);
  line-height: 1;
  font-family: var(--font-mono);
  letter-spacing: -0.04em;
}
h1 { font-size: var(--text-xl); letter-spacing: -0.02em; }
.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-accent);
  text-decoration: none;
  transition: opacity 140ms;
}
.back-link:hover { opacity: 0.75; }
</style>