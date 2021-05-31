<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length">
          <q-card
            class="card-post q-mb-md"
            :class="{ 'bg-red-1': post.offline }"
            flat
            bordered
            v-for="post in posts"
            :key="post.id"
          >
            <q-badge
              class="badge-offline absolute-top-right"
              color="red"
              v-if="post.offline"
              >Stored Offline
            </q-badge>

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
        </template>

        <template v-else-if="!loadingPosts && !posts.length">
          <h5 class="text-center text-grey">No posts yet.</h5>
        </template>

        <template v-else>
          <q-card flat bordered v-for="i in 2" class="q-mb-md" :key="i">
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" animation="fade" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade" />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade" />
              <q-skeleton
                type="text"
                width="50%"
                class="text-subtitle2"
                animation="fade"
              />
            </q-card-section>
          </q-card>
        </template>
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
import { date } from "quasar";
import { openDB } from "idb";

export default {
  name: "PageHome",
  data() {
    return {
      posts: [],
      loadingPosts: false,
    };
  },
  filters: {
    niceDate(timeStamp) {
      return date.formatDate(timeStamp, "MMMM D, HH:m");
    },
  },
  computed: {
    supportsServiceWorker() {
      return "serviceWorker" in navigator;
    },
  },
  activated() {
    this.getPosts();
  },
  created() {
    this.listenForOfflinePostUploaded();
  },
  methods: {
    listenForOfflinePostUploaded() {
      if (!this.supportsServiceWorker) {
        return;
      }

      const channel = new BroadcastChannel("sw-messages");

      channel.addEventListener("message", (e) => {
        console.log("Received", e.data);
        if (e.data.msg === "offline-post-uploaded") {
          const offlinePostsCount = this.posts.filter(
            (post) => post.offline === true
          ).length;

          this.posts[offlinePostsCount - 1].offline = false;
        }
      });
    },
    getOfflinePosts() {
      openDB("workbox-background-sync").then((db) => {
        db.getAll("requests")
          .then((requests) => {
            requests.forEach((failedRequest) => {
              if (failedRequest.queueName === "create_post_queue") {
                const { url } = failedRequest.requestData;

                const request = new Request(url, failedRequest.requestData);

                request.formData().then((formData) => {
                  let offlinePost = {};

                  offlinePost.id = formData.get("id");
                  offlinePost.caption = formData.get("caption");
                  offlinePost.location = formData.get("location");
                  offlinePost.createdAt = parseInt(formData.get("createdAt"));
                  offlinePost.offline = true;

                  const reader = new FileReader();
                  reader.readAsDataURL(formData.get("file"));

                  reader.onloadend = () => {
                    offlinePost.imageUrl = reader.result;

                    this.posts.unshift(offlinePost);
                  };
                });
              }
            });
          })
          .catch((error) => {
            console.log(`Error accessing DB data ${error}`);
          });
      });
    },
    getPosts() {
      this.loadingPosts = true;

      this.$axios
        .get(`${process.env.API}/posts`)
        .then(({ data }) => {
          const { posts } = data.data;

          this.posts = posts;
          this.loadingPosts = false;

          if (!navigator.onLine) {
            this.getOfflinePosts();
          }
        })
        .catch((error) => {
          this.loadingPosts = false;

          console.log(error);

          this.$q.dialog({
            title: "Error",
            message: "Could not get posts.",
          });
        });
    },
  },
};
</script>

<style lang="sass">
.card-post
  .badge-offline
    border-top-left-radius: 0 !important

  .q-img
    min-height: 200px
</style>
