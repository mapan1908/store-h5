<template>
  <div>
    <slot />
    <van-tabbar route fixed placeholder z-index="1" safe-area-inset-bottom>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/order" icon="friends-o">订单</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
