<template>
    <div v-if="thread" class="flex flex-row gap-6 py-3 pr-7 pl-5 w-full xs:rounded-xl bg-2 text-2">
        <div class="flex flex-col gap-1 items-center">
            <UpvoteIcon
                :full="thread.post.interactions.voted === 1"
                width="1.5rem"
                height="1.5rem"
                class="hover:text-blue-500 cursor-pointer"
                :class="[thread.post.interactions.voted === 1 ? 'text-green-600' : 'text-5']"
                @click="
                    thread.post.interactions.voted === 1
                        ? threads.voteContent(thread.post.contentId, 0)
                        : threads.voteContent(thread.post.contentId, 1)
                "
            />
            <div class="text-xl">
                {{ abbrNumbers(thread.post.upvotes - thread.post.downvotes) }}
            </div>
            <DownvoteIcon
                :full="thread.post.interactions.voted === -1"
                width="1.5rem"
                height="1.5rem"
                class="hover:text-blue-500 cursor-pointer"
                :class="[thread.post.interactions.voted === -1 ? 'text-red-600' : 'text-5']"
                @click="
                    thread.post.interactions.voted === -1
                        ? threads.voteContent(thread.post.contentId, 0)
                        : threads.voteContent(thread.post.contentId, -1)
                "
            />
        </div>
        <div class="flex flex-col">
            <AppTip :tip="`${threadTypes[thread.type]?.fr}`">
                <div
                    class="flex justify-center items-center w-[3.3rem] h-[3.3rem] rounded-lg cursor-pointer"
                    :class="`bg-${threadTypes[thread.type]?.color}-100 dark:bg-${
                        threadTypes[thread.type]?.color
                    }-900`"
                >
                    <i :class="`fas fa-${threadTypes[thread.type]?.icon}`" class="text-xl" />
                </div>
            </AppTip>
            <AppTip :tip="`${thread.replyCount} réponse${thread.replyCount > 1 ? 's' : ''}`">
                <div
                    class="flex flex-row gap-2 justify-center items-center p-1 mt-3 rounded cursor-pointer select-none"
                    :class="
                        thread.opValidatedWith || thread.adminValidatedWith ? 'bg-green-500 text-white' : ''
                    "
                >
                    <p>{{ abbrNumbers(thread.replyCount) }}</p>
                    <i
                        v-if="thread.opValidatedWith && thread.adminValidatedWith"
                        class="fa fa-double-check"
                    />
                    <i v-else-if="thread.opValidatedWith" class="fa fa-check" />
                    <i v-else class="text-sm fa fa-message" />
                </div>
            </AppTip>
        </div>
        <div class="flex flex-col gap-1.5 w-full">
            <router-link
                :to="`/threads/${thread.contentMasterId}`"
                class="text-xl font-semibold hover:underline line-clamp-1 text-0"
            >
                {{ thread.title }}
            </router-link>

            <div class="text-sm text-justify line-clamp-2 text-2">
                {{ thread.post.body }}
            </div>

            <div class="flex gap-6 items-center mt-1 w-full text-xs">
                <div class="flex gap-2 items-center">
                    <UserAvatar
                        :img-src="thread.post.author.avatar"
                        :username="fullname(thread.post.author)"
                        :size="1.8"
                    />
                    <div class="text-xs">
                        {{ fullname(thread.post.author) }}
                        <AppTip :tip="getRole(thread.post.author)[$i18n.locale]">
                            <i class="ml-1" :class="`fa fa-${getRole(thread.post.author).icon}`" />
                        </AppTip>
                    </div>
                </div>
                <div class="flex gap-2 items-center">
                    <i class="text-base fa fa-calendar icon-color" />
                    <DatePreview class="ml-2" :date="thread.createdAt" />
                </div>
                <div
                    v-if="thread.createdAt !== thread.post.lastEdit.createdAt"
                    class="flex gap-2 items-center"
                >
                    <i class="text-base fa fa-clock-rotate-left icon-color" />
                    <DatePreview class="ml-2" :date="thread.createdAt" />
                </div>

                <!-- TEMP: display only first tag -->
                <AppTag v-if="thread.tags.length > 0" :tag-name="thread.tags[0].name" />
            </div>
        </div>
    </div>
    <div v-else class="flex py-3 px-5 space-x-2 font-semibold rounded-lg">
        <p class="text-lg text-0">Erreur: Ce post est vide.</p>

        <!-- TODO: Bug report pages -->
        <router-link :to="`/report-bug/threads`" class="text-lg font-semibold line-clamp-1 link-blue">
            Signalez ce bug !
        </router-link>
    </div>
</template>

<script setup>
    import { fullname, getRole } from '@/utils/users'
    // import TagList from '@/components/List/TagList.vue'
    // import UserPreview from '@/components/App/Preview/UserPreview.vue'
    import AppTag from '@/components/App/AppTag.vue'

    // import Popper from 'vue3-popper'
    import { useThreadsStore } from '@/store/threads.store'

    import threadTypes from '@/shared/types/thread-types.enum'

    // import { timeAgo } from '@/utils/timeAgo'
    import { abbrNumbers } from '@/utils/abbrNumbers'
    import AppTip from '../AppTip.vue'
    import UpvoteIcon from '../Icon/UpvoteIcon.vue'
    import DownvoteIcon from '../Icon/DownvoteIcon.vue'
    import DatePreview from '../Preview/DatePreview.vue'
    // import UserPreview from '../Preview/UserPreview.vue'
    import UserAvatar from '@/components/User/UserAvatar.vue'

    const threads = useThreadsStore()

    defineProps({
        thread: {
            type: Object,
            required: true,
        },
    })
</script>

<style>
    .icon-color {
        @apply text-gray-300;
    }
</style>
