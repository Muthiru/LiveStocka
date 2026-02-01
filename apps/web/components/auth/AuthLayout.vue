<template>
  <div class="min-h-screen flex flex-row">
    <!-- Left side - Brand & Features  -->
    <div class="w-1/2 flex items-center justify-center px-8 py-12 bg-white border-r-2 border-black">
      <div class="flex flex-col justify-center items-center w-full max-w-lg">
        <div class="text-center w-full">
          <slot name="brand" />
          <slot name="features" />
          <slot name="image" />
        </div>
      </div>
    </div>

    <!-- Right side - Form  -->
    <div class="w-1/2 flex items-center justify-center px-8 py-12 bg-white">
      <div class="w-full max-w-md">
        <slot name="form" />
      </div>
    </div>
  </div>
</template>

<script setup>
// This component provides the base layout for auth pages
</script>