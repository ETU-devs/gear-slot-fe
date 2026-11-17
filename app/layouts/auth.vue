<template>
  <div class="auth-layout">
    <header class="shell auth-top">
      <LayoutBrand />
      <LayoutThemeToggle />
    </header>
    <UMain
      id="content"
      class="shell auth-main"
    >
      <div
        class="auth-art"
        aria-hidden="true"
      >
        <div class="orbit orbit-outer" />
        <div class="orbit orbit-inner" />
        <div class="art-tile art-tile-camera">
          <UIcon name="i-lucide-camera" />
        </div>
        <div class="art-tile art-tile-main">
          <UIcon name="i-lucide-calendar-check-2" />
        </div>
        <div class="art-tile art-tile-mic">
          <UIcon name="i-lucide-mic" />
        </div>
      </div>
      <slot />
    </UMain>
  </div>
</template>
