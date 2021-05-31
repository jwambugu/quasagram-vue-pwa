<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-10" bordered>
      <q-toolbar class="constrain">
        <q-btn
          class="large-screen-only q-mr-sm"
          :to="{ name: 'page.camera' }"
          flat
          round
          icon="eva-camera-outline"
          size="18px"
          dense
        />

        <q-separator class="large-screen-only" vertical spaced />

        <q-toolbar-title class="text-grand-hotel text-bold"
          >Quasagram
        </q-toolbar-title>

        <q-btn
          class="large-screen-only"
          :to="{ name: 'page.home' }"
          flat
          round
          icon="eva-home-outline"
          size="18px"
          dense
        />
      </q-toolbar>
    </q-header>

    <q-footer class="bg-white">
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div class="banner-container bg-primary" v-if="showInstallationBanner">
          <div class="constrain">
            <q-banner inline-actions class="bg-primary text-white" dense>
              <b>Install Quasagram?</b>

              <template v-slot:avatar>
                <q-avatar
                  color="white"
                  text-color="grey-10"
                  icon="eva-camera-outline"
                  font-size="10px"
                />
              </template>

              <template v-slot:action>
                <q-btn
                  flat
                  label="Yes"
                  dense
                  class="q-px-sm"
                  no-caps
                  @click="installApp"
                />
                <q-btn
                  flat
                  label="Later"
                  dense
                  class="q-px-sm"
                  no-caps
                  @click="showInstallationBanner = false"
                />
                <q-btn
                  flat
                  label="Never"
                  dense
                  class="q-px-sm"
                  no-caps
                  @click="neverShowInstallationBanner"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </transition>

      <q-tabs
        class="text-grey-10 small-screen-only"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-route-tab
          :to="{ name: 'page.home' }"
          icon="eva-home-outline"
          exact
        />
        <q-route-tab
          :to="{ name: 'page.camera' }"
          icon="eva-camera-outline"
          exact
        />
      </q-tabs>
    </q-footer>

    <q-page-container class="bg-grey-1">
      <keep-alive :include="['PageHome']">
        <router-view />
      </keep-alive>
    </q-page-container>
  </q-layout>
</template>

<script>
let deferredPrompt;
export default {
  name: "MainLayout",
  data() {
    return {
      showInstallationBanner: false,
    };
  },
  mounted() {
    const status = this.$q.localStorage.getItem(
      "never_show_installation_banner"
    );

    if (status) {
      return;
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();

      deferredPrompt = e;

      setTimeout(() => {
        this.showInstallationBanner = true;
      }, 3000);
    });
  },
  methods: {
    neverShowInstallationBanner() {
      this.showInstallationBanner = false;
      this.$q.localStorage.set("never_show_installation_banner", true);
    },
    installApp() {
      // Hide the app provided install promotion
      this.showInstallationBanner = false;

      // Show the install prompt
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((result) => {
        if (result.outcome === "accepted") {
          this.neverShowInstallationBanner();
        }
      });
    },
  },
};
</script>

<style lang="sass">
.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 77px

.q-toolbar__title
  font-size: 30px
  @media (max-width: $breakpoint-xs-max)
    text-align: center

.q-footer
  .q-tab__icon
    font-size: 30px
</style>
