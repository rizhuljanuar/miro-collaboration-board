<script setup lang='ts'>
const applicationName = 'Miro Collaboration Board';
</script>

<template>
    <main class='app-shell'>
        <section class='app-shell__content'>
            <p class='app-shell__eyebrow'>Vue 3 + TypeScript siap</p>

            <h1>{{ applicationName }}</h1>

            <p>
                Fondasi frontend berhasil dijalankan. Kita akan menambahkan Vue Router,
                halaman login, daftar project, dan project board pada langkah berikutnya.
            </p>
        </section>
    </main>
</template>

<style scoped>
.app-shell {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 24px;
    background: #f8fafc;
    color: #0f172a;
}

.app-shell__content {
    width: min(100%, 640px);
    padding: 32px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 12px 32px rgb(15 23 42 / 8%);
}

.app-shell__eyebrow {
    margin: 0 0 8px;
    color: #2563eb;
    font-weight: 700;
}

h1 {
    margin: 0;
    font-size: clamp(2rem, 6vw, 3rem);
}

p {
    line-height: 1.7;
}
</style>
