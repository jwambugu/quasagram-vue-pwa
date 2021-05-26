<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <q-card
          class="card-post q-mb-md"
          flat
          bordered
          v-for="post in posts"
          :key="post.id"
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img
                  src="https://pbs.twimg.com/profile_images/984725888205053952/06e9L7cz.jpg"
                  alt="Avatar"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">jwambugu</q-item-label>
              <q-item-label caption>{{ post.location }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-img :src="post.imageUrl" :alt="post.caption" />

          <q-card-section>
            <div>{{ post.caption }}</div>

            <div class="text-caption text-grey">
              {{ post.createdAt | niceDate }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img
                src="https://pbs.twimg.com/profile_images/984725888205053952/06e9L7cz.jpg"
                alt="Avatar"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">jwambugu</q-item-label>
            <q-item-label caption>Jay Wambugu</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import {date} from "quaar"

export default {
  name: "PageHome",
  data() {
    return {
      posts: [
        {
          id: 1,
          caption: "Golden Gate Bridge",
          createdAt: 1622010938600,
          location: "Nairobi, Kenya",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
        {
          id: 2,
          caption: "Golden Gate Bridge",
          createdAt: 1622010938600,
          location: "Nairobi, Kenya",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
        {
          id: 3,
          caption: "Golden Gate Bridge",
          createdAt: 1622010938600,
          location: "Nairobi, Kenya",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
        {
          id: 4,
          caption: "Golden Gate Bridge",
          createdAt: 1622010938600,
          location: "Nairobi, Kenya",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
      ],
    }
  },
  filters: {
    niceDate(timeStamp) {
      return date.formatDate(timeStamp, "MMMM D, HH:m")
    },
  ,
}
</script>

<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
