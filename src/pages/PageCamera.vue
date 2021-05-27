<template>
  <q-page class="constrain-more q-pa-md">
    <div class="row q-mb-md" v-if="errorMessage">
      <div class="col">
        <q-card class="text-white text-center bg-red-9" col>
          <q-card-section>
            <div class="text-subtitle1">{{ errorMessage }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="camera-frame q-pa-md">
      <video class="full-width" autoplay ref="video" v-show="!imageCaptured" />

      <canvas
        ref="canvas"
        class="full-width"
        height="100"
        v-show="imageCaptured"
      />
    </div>

    <div class="text-center q-pa-md">
      <div v-if="hasCameraSupport">
        <q-btn
          round
          color="grey-10"
          icon="eva-camera"
          size="lg"
          @click="captureImage"
          v-if="!imageCaptured"
        />
        <q-btn
          round
          color="grey-10"
          icon="eva-camera"
          size="lg"
          v-else
          disable
        />
      </div>

      <div class="row justify-center" v-else>
        <q-file
          label="Choose an image"
          v-model="uploadedImage"
          dense
          class="col col-sm-8"
          accept="image/*"
          @input="uploadImage"
        >
          <template v-slot:prepend>
            <q-icon name="eva-attach-outline" />
          </template>
        </q-file>
      </div>
    </div>

    <div class="row justify-center q-ma-md">
      <q-input
        class="col col-sm-8"
        label="Caption *"
        dense
        color="grey-10"
        v-model="post.caption"
      />
    </div>

    <div class="row justify-center q-ma-md">
      <q-input
        class="col col-sm-8"
        label="Location"
        dense
        color="grey-10"
        v-model="post.location"
        :loading="loadingLocation"
      >
        <template v-slot:append v-if="!loadingLocation && supportsGeolocation">
          <q-btn
            round
            dense
            flat
            icon="eva-navigation-2-outline"
            @click="getUserLocation"
          />
        </template>
      </q-input>
    </div>

    <div class="row justify-center q-mt-lg">
      <q-btn
        unelevated
        rounded
        color="grey-10"
        label="Post Image"
        no-caps
        @click="createPost"
        :disable="!canCreatePost"
      />
    </div>
  </q-page>
</template>

<script>
import { uid } from "quasar";

require("md-gum-polyfill");

export default {
  name: "PageCamera",
  data() {
    return {
      post: {
        id: uid(),
        caption: "",
        location: "",
        photo: null,
        createdAt: Date.now(),
      },
      errorMessage: "",
      imageCaptured: false,
      hasCameraSupport: true,
      uploadedImage: null,
      loadingLocation: false,
    };
  },
  computed: {
    supportsGeolocation() {
      return "geolocation" in navigator;
    },
    canCreatePost() {
      return this.post.caption && this.post.photo;
    },
  },
  mounted() {
    this.initCamera();
  },
  beforeDestroy() {
    if (this.hasCameraSupport) {
      this.disableCamera();
    }
  },
  methods: {
    async initCamera() {
      let stream = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        this.$refs.video.srcObject = stream;
      } catch (e) {
        // this.errorMessage = "Please allow permission to access the camera.";
        this.hasCameraSupport = false;
      }
    },
    disableCamera() {
      this.$refs.video.srcObject.getVideoTracks().forEach((track) => {
        if (track.readyState === "live" && track.kind === "video") {
          track.stop();
        }
      });
    },
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      const byteString = atob(dataURI.split(",")[1]);

      // separate out the mime component
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

      // write the bytes of the string to an ArrayBuffer
      const ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      const ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      return new Blob([ab], { type: mimeString });
    },
    captureImage() {
      let video = this.$refs.video;
      let canvas = this.$refs.canvas;

      canvas.width = video.getBoundingClientRect().width;
      canvas.height = video.getBoundingClientRect().height;

      let context = canvas.getContext("2d");

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.imageCaptured = true;

      this.post.photo = this.dataURItoBlob(canvas.toDataURL());

      this.disableCamera();
    },
    uploadImage(file) {
      this.post.photo = file;

      const reader = new FileReader();

      let canvas = this.$refs.canvas;
      let context = canvas.getContext("2d");

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);

          this.imageCaptured = true;
        };

        const { result } = event.target;

        img.src = result;
      };

      reader.readAsDataURL(file);
    },
    gotLocationSuccessfully({ city, country }) {
      this.post.location = city;

      if (country) {
        this.post.location += `, ${country}`;
      }
    },
    handleLocationError() {
      this.$q.dialog({
        title: "Error",
        message: "Could not find your location.",
      });

      this.loadingLocation = false;
    },
    getCityAndCountry({ latitude, longitude }) {
      const url = `https://geocode.xyz/${latitude},${longitude}?json=1`;

      this.$axios
        .get(url)
        .then(({ data }) => {
          this.gotLocationSuccessfully(data);
        })
        .catch(() => {
          this.handleLocationError();
        });
    },
    getUserLocation() {
      this.loadingLocation = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.getCityAndCountry(position.coords);
          this.loadingLocation = false;
        },
        () => {
          this.handleLocationError();
        },
        {
          timeout: 7000,
        }
      );
    },
    createPost() {
      this.$q.loading.show();

      const formData = new FormData();

      const { id, caption, location, createdAt, photo } = this.post;

      const imageType = photo.type.split("/")[1];
      const filename = `${id}.${imageType}`;

      formData.append("id", id);
      formData.append("caption", caption);
      formData.append("location", location);
      formData.append("createdAt", createdAt.toString());
      formData.append("file", photo, filename);

      this.$axios
        .post(`${process.env.API}/posts`, formData)
        .then(() => {
          this.$q.loading.hide();

          this.$q.notify({
            message: "Image successfully posted.",
            actions: [
              {
                label: "Dismiss",
                color: "white",
              },
            ],
          });

          this.$router.push({
            name: "page.home",
          });
        })
        .catch((error) => {
          console.log(error);
          this.$q.loading.hide();

          this.$q.dialog({
            title: "Error",
            message: "Sorry! Something went wrong.",
          });
        });
    },
  },
};
</script>

<style lang="sass">
.camera-frame
  border: 2px solid $grey-10
  border-radius: 10px
</style>
