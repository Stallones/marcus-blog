<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue';
import {getTimeLine} from "@/apis/article";


function handleData(data: any[]) : Record<string, any[]> {
  // 过滤内容
  data = data.map((item: any) => {
    item.articleContent = item.articleContent.replace(/[*#>`~\-\\[\]()\s]|(\n\n)/g, '');
    // 提取前 50 个字符
    item.articleContent = item.articleContent.substring(0, 60) + '...';
    // 时间去掉时分秒
    item.createTime = item.createTime.substring(0, 10);
    return item;
  });
  const groupedArticles = data.reduce((groups: Record<string, any[]>, article: any) => {
    const year = new Date(article.createTime).getFullYear();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(article);
    return groups;
  }, {} as Record<string, any[]>);
  return groupedArticles;
}

const shellRef = ref<HTMLElement | null>(null);
const items = ref<any>({});

onMounted(async () => {
  await getTimeLine().then((res: any) => {
    items.value = handleData(res.data)
  })
  await nextTick(() => {
    const shell = shellRef.value;
    if (!shell) return;
    const itemElements = shell.querySelectorAll('.item');
    const itemsArray = Array.from(itemElements) as HTMLElement[];

    if (itemsArray.length === 0) return;

    // 将第一个时间轴项目激活，并设置时间轴背景图片为第一个项目的图片
    itemsArray[0].classList.add('item--active');
    const firstImg = itemsArray[0].querySelector('.img') as HTMLImageElement | null;
    if (firstImg && shell) shell.style.backgroundImage = `url(${firstImg.src})`;

    // 当页面滚动时，触发滚动事件
    window.addEventListener('scroll', () => {
      const pos = window.pageYOffset;
      itemsArray.forEach((item, i) => {
        const min = item.offsetTop;
        const max = item.offsetHeight + item.offsetTop;

        if (i === itemsArray.length - 2 && pos > min + item.offsetHeight / 2) {
          itemsArray.forEach(item => item.classList.remove('item--active'));
          const lastImg = itemsArray[itemsArray.length - 1].querySelector('.img') as HTMLImageElement | null;
          if (lastImg && shell) shell.style.backgroundImage = `url(${lastImg.src})`;
          itemsArray[itemsArray.length - 1].classList.add('item--active');
        } else if (pos <= max - 10 && pos >= min) {
          const curImg = item.querySelector('.img') as HTMLImageElement | null;
          if (curImg && shell) shell.style.backgroundImage = `url(${curImg.src})`;
          itemsArray.forEach(item => item.classList.remove('item--active'));
          item.classList.add('item--active');
        }
      });
    });
  });
});

</script>
<template>
  <div>
    <Main only-father-container>
      <template #banner>
        <Banner title="时间轴" subtitle="TimeLine"/>
      </template>
      <template #content>
        <div class="shell" ref="shellRef">
          <div class="timeline">
            <template v-for="(item,year) in items" :key="item.id">
              <div class="year">--{{ year }}--</div>
              <div class="item" @click="$router.push(`/article/${i.id}`)" :data-text="i.createTime" v-for="i in item">
                <div class="content">
                  <img class="img" :src="i.articleCover"/>
                  <h2 class="content-title">{{ i.articleTitle }}</h2>
                  <p class="content-desc">{{ i.articleContent }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </Main>
  </div>
</template>

<style lang="scss" scoped>
@use './index' as *;

.year {
  background-color: white;
  position: sticky;
  top: 5rem;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
  color: grey;
  border-radius: $border-radius;
  // 背景透明度
  opacity: 0.8;
}
</style>