<template>
    <div class="min-h-screen relative overflow-hidden">
        <!-- Animated background gradients -->
        <div class="absolute -top-1/2 -left-1/2 w-full h-full animated-gradient opacity-30 blur-3xl"></div>
        <div class="absolute -bottom-1/2 -right-1/2 w-full h-full animated-gradient opacity-30 blur-3xl"></div>

        <main class="relative max-w-[900px] mx-auto px-4 py-8">
            <div class="glass-card p-8 relative overflow-hidden">
                <div class="absolute inset-0 animated-gradient opacity-10"></div>
                <div class="relative">
                    <h1
                        class="font-raleway text-3xl font-bold mb-6 text-center bg-gradient-to-r from-toda-primary to-toda-secondary inline-block text-transparent bg-clip-text">
                        Merchant Onboarding
                    </h1>
                    <p class="text-gray-300 text-center mb-8">
                        Onboarding process will be implemented in the next phase
                    </p>
                    <div class="text-center">
                        <router-link to="/"
                            class="px-6 py-3 bg-gradient-to-r from-toda-primary to-toda-secondary rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            Back to Home
                        </router-link>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
