<script setup lang='ts'>
const applicationName = 'Miro Collaboration Board';
</script>

<template>
    <main
        class='grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-12 text-white'
    >
        <section
            class='w-full max-w-2xl rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur md:p-12'
        >
            <p class='mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-300'>
                Frontend setup
            </p>

            <h1 class='text-4xl font-bold tracking-tight md:text-5xl'>
                {{ applicationName }}
            </h1>

            <p class='mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg'>
                Vue 3, TypeScript, Vite, dan Tailwind CSS sudah terhubung. Berikutnya kita
                akan menata struktur folder frontend agar siap untuk halaman login, daftar
                project, dan board realtime.
            </p>

            <div class='mt-8 flex flex-wrap gap-3'>
                <span class='rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-200'>
                    Vue 3
                </span>

                <span class='rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-medium text-cyan-200'>
                    TypeScript
                </span>

                <span class='rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-200'>
                    Tailwind CSS
                </span>
            </div>
        </section>
    </main>
</template>
