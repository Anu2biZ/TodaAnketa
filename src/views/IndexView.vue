<template>
    <div class="min-h-screen relative overflow-hidden">

        <main class="relative mt-10 max-w-[900px] mx-auto px-4 py-8">
            <!-- Logo -->
            <div class="text-center mb-12 flex justify-center">
                <img class="h-[60px]" src="/logo-1.svg" alt="">
            </div>

            <!-- Banner -->
            <div class="glass-card px-8 py-20 mb-8 text-center relative overflow-hidden ">
                <div class="relative">
                    <h2 class="font-raleway text-3xl font-bold mb-4 bg-gradient-to-r from-toda-primary via-toda-secondary to-toda-accent inline-block text-transparent bg-clip-text">
                        We are Toda Pay
                    </h2>
                    <p class="text-lg text-gray-300 max-w-2xl mx-auto">
                      Our mission is to provide custom solutions for each client based on their unique needs. We carefully analyze requests and offer the best payment solutions that help businesses achieve success, ensuring flexibility, reliability, and maximum efficiency at every stage.
                    </p>
                </div>
            </div>

            <!-- Action Blocks -->
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Application Block -->
                <div class="glass-card p-6 py-12 flex flex-col items-center ">
                    <h3 class="font-raleway text-xl font-semibold mb-4">Application Form</h3>
                    <p class="text-gray-300 text-center mb-6">
                        Start your journey with Toda Pay by submitting your merchant application.
                    </p>
                    <router-link to="/application"
                        class="px-6 py-3 bg-gradient-to-r from-toda-primary via-toda-secondary to-toda-accent rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        Apply Now
                    </router-link>
                </div>

                <!-- Onboarding Block -->
                <div class="glass-card  p-6 py-12 flex flex-col items-center ">
                    <h3 class="font-raleway text-xl font-semibold mb-4">Merchant Onboarding</h3>
                    <p class="text-gray-300 text-center mb-6">
                        Already approved? Complete your merchant onboarding process here.
                    </p>
                    <router-link to="/onboarding"
                        class="px-6 py-3 bg-gradient-to-r from-toda-primary via-toda-secondary to-toda-accent rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        Start Onboarding
                    </router-link>
                </div>
            </div>

            <!-- Footer -->
            <footer class="mt-16 text-center text-gray-400">
              <p class="text-xs">
                SMART PAYMENTS TECHNOLOGIES LTD (MSB registration number: M20438511), a company incorporated and registered in the Province of British Columbia, Canada under company registration number BC1266435, the registered office of which is at 170-6660 GRAYBAR ROAD, 2ND FLOOR, OFFICE # 8T RICHMOND, BC, CANADA V6W1H9
              </p>
                <p class="mt-4 text-xs">&copy; {{ new Date().getFullYear() }} Toda Payments. All rights reserved.</p>


            </footer>
        </main>
    </div>
</template>
