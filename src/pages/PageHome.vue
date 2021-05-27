<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length">
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
  created() {
    this.getPosts();
  },
  methods: {
    getPosts() {
      this.loadingPosts = true;

      this.$axios
        .get(`${process.env.API}/posts`)
        .then(({ data }) => {
          const { posts } = data.data;

          this.posts = posts;
          this.loadingPosts = false;
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
  .q-img
    min-height: 200px
</style>
