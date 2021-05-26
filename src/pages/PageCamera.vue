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
      <q-btn
        round
        color="grey-10"
        icon="eva-camera"
        size="lg"
        @click="captureImage"
        v-if="!imageCaptured"
      />
      <q-btn round color="grey-10" icon="eva-camera" size="lg" v-else disable />
    </div>

    <div class="row justify-center q-ma-md">
      <q-input
        class="col col-sm-8"
        label="Caption"
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
      >
        <template v-slot:append>
          <q-btn round dense flat icon="eva-navigation-2-outline" />
        </template>
      </q-input>
    </div>

    <div class="row justify-center q-mt-lg">
      <q-btn unelevated rounded color="grey-10" label="Post Image" no-caps />
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
    };
  },
  mounted() {
    this.initCamera();
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
        this.errorMessage = "Please allow permission to access the camera.";
      }
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
    },
  },
};
</script>

<style lang="sass">
.camera-frame
  border: 2px solid $grey-10
  border-radius: 10px
</style>
