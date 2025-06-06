import { ref, onBeforeUnmount, nextTick } from "vue";
import type { Ref } from "vue";

export default function useScrollCategory(options: {
  categories: Ref<any[]>;
  scrollContainer?: Ref<HTMLElement | undefined>;
  categoryIdPrefix?: string;
  lockDuration?: number;
}) {
  const {
    categories,
    scrollContainer,
    categoryIdPrefix = "category-",
    lockDuration = 800,
  } = options;

  // 当前选中的分类索引
  const currentCategoryIndex = ref(0);

  // 当前需要滚动到的分类ID
  const currentCategoryScrollId = ref("");

  // 滚动锁定状态
  const isScrollLocked = ref(false);

  // 滚动锁定的定时器
  let scrollLockTimeout: number | null = null;

  // 是否正在手动滚动到目标分类
  const isManualScrolling = ref(false);

  /**
   * 节流函数，避免高频触发
   */
  const throttle = (fn: (...args: any[]) => void, delay: number) => {
    let lastCall = 0;
    let timer: number | null = null;

    return function (...args: any[]) {
      const now = new Date().getTime();

      // 如果是第一次调用或者超过延迟时间
      if (now - lastCall >= delay) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        lastCall = now;
        fn(...args);
      } else if (!timer) {
        // 添加尾部调用，确保最后一次调用也被执行
        timer = setTimeout(() => {
          lastCall = new Date().getTime();
          timer = null;
          fn(...args);
        }, delay) as unknown as number;
      }
    };
  };

  /**
   * 暂时锁定滚动，避免事件循环
   */
  const lockScrollTemporarily = (duration = lockDuration) => {
    isScrollLocked.value = true;
    isManualScrolling.value = true;

    if (scrollLockTimeout) {
      clearTimeout(scrollLockTimeout);
    }

    scrollLockTimeout = setTimeout(() => {
      isScrollLocked.value = false;
      isManualScrolling.value = false;
    }, duration) as unknown as number;
  };

  /**
   * 商品区滚动处理
   */
  const onProductScroll = throttle((e: Event) => {
    if (isScrollLocked.value) {
      return;
    }

    let scrollTop = 0;
    if (
      e &&
      (e as any).detail &&
      typeof (e as any).detail.scrollTop === "number"
    ) {
      scrollTop = (e as any).detail.scrollTop;
    } else if (
      e &&
      e.target &&
      typeof (e.target as HTMLElement).scrollTop === "number"
    ) {
      scrollTop = (e.target as HTMLElement).scrollTop;
    }

    calculateCurrentCategory(scrollTop);
  }, 150); // 节流延迟150ms

  /**
   * 计算当前显示的分类
   */
  const calculateCurrentCategory = (scrollTop: number) => {
    if (!categories.value || categories.value.length === 0) return;
    // 检查是否在客户端环境
    if (typeof document === "undefined") return;

    // 如果正在手动滚动，不要自动更新分类索引
    if (isManualScrolling.value) {
      return;
    }

    // H5 兼容：用 getBoundingClientRect
    const rects: (DOMRect | null)[] = [];
    for (let i = 0; i < categories.value.length; i++) {
      const el = document.getElementById(`${categoryIdPrefix}${i}`);
      rects.push(el ? el.getBoundingClientRect() : null);
    }

    const stickyHeaderHeight = 56; // 调整为更精确的高度
    let newIndex = 0;

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect && rect.top - stickyHeaderHeight <= 0) {
        newIndex = i;
      }
    }

    if (Math.abs(newIndex - currentCategoryIndex.value) > 0) {
      currentCategoryIndex.value = newIndex;
      currentCategoryScrollId.value = "";
    }
  };

  /**
   * 点击左侧分类切换
   */
  const handleCategorySelect = (index: number) => {
    console.log(
      "[useScrollCategory] handleCategorySelect 被调用，index:",
      index
    );

    if (isScrollLocked.value) {
      console.log("[useScrollCategory] 滚动被锁定，返回");
      return;
    }

    // 立即设置目标分类索引，避免滚动过程中的跳动
    currentCategoryIndex.value = index;

    // 锁定滚动，防止自动更新覆盖手动选择
    lockScrollTemporarily();

    nextTick(() => {
      // 检查是否在客户端环境
      if (typeof document === "undefined") {
        console.log("[useScrollCategory] 服务端环境，跳过滚动");
        return;
      }

      if (categories.value && categories.value[index]) {
        const targetElementId = `${categoryIdPrefix}${index}`;
        const targetElement = document.getElementById(targetElementId);

        console.log("[useScrollCategory] 目标元素ID:", targetElementId);
        console.log("[useScrollCategory] 找到目标元素:", !!targetElement);
        console.log("[useScrollCategory] 滚动容器:", !!scrollContainer?.value);

        if (targetElement && scrollContainer?.value) {
          const containerScrollTop = scrollContainer.value.scrollTop;

          // 找到分类标题元素（h3）
          const headerElement = targetElement.querySelector("h3");

          let elementTop = 0;

          if (headerElement) {
            // 使用h3标题的位置
            elementTop = headerElement.offsetTop;

            // 累计所有父元素的offsetTop，直到滚动容器
            let current: HTMLElement | null =
              headerElement.offsetParent as HTMLElement;
            while (current && current !== scrollContainer.value) {
              elementTop += current.offsetTop;
              current = current.offsetParent as HTMLElement;
            }
          } else {
            // 如果没有找到h3，回退到容器位置
            elementTop = targetElement.offsetTop;
            let offsetParent = targetElement.offsetParent;
            while (offsetParent && offsetParent !== scrollContainer.value) {
              elementTop += (offsetParent as HTMLElement).offsetTop;
              offsetParent = (offsetParent as HTMLElement).offsetParent;
            }
          }

          console.log("[useScrollCategory] === 滚动调试信息 ===");
          console.log("[useScrollCategory] 目标分类索引:", index);
          console.log(
            "[useScrollCategory] 分类ID:",
            categories.value[index]?.id
          );
          console.log(
            "[useScrollCategory] 分类名称:",
            categories.value[index]?.name
          );
          console.log("[useScrollCategory] 找到标题元素:", !!headerElement);
          console.log("[useScrollCategory] 计算的目标位置:", elementTop);
          console.log("[useScrollCategory] 当前滚动位置:", containerScrollTop);

          // 打印所有分类的位置信息用于对比
          console.log("[useScrollCategory] 所有分类位置对比:");
          categories.value.forEach((cat, idx) => {
            const el = document.getElementById(`${categoryIdPrefix}${idx}`);
            const h3 = el?.querySelector("h3");
            if (el && h3) {
              let pos = h3.offsetTop;
              let parent = h3.offsetParent as HTMLElement;
              while (parent && parent !== scrollContainer.value) {
                pos += parent.offsetTop;
                parent = parent.offsetParent as HTMLElement;
              }
              console.log(
                `  Index ${idx}: ${cat.name} (ID: ${cat.id}) -> 标题位置: ${pos}`
              );
            }
          });

          // 计算页面顶部固定元素的高度偏移
          let topOffset = 0;

          // 尝试获取StoreHeader的高度
          const storeHeaderElements = document.querySelectorAll(
            '[class*="store"], [class*="header"], .flex-shrink-0'
          );
          for (const el of storeHeaderElements) {
            if (
              el.getBoundingClientRect &&
              el.getBoundingClientRect().top === 0
            ) {
              topOffset = Math.max(
                topOffset,
                el.getBoundingClientRect().height
              );
            }
          }

          // 如果没有找到固定头部，尝试其他方法
          if (topOffset === 0) {
            // 查找页面顶部可能的固定元素
            const fixedElements = document.querySelectorAll(
              '[style*="position: fixed"], [style*="position:fixed"], .fixed, .sticky'
            );
            for (const el of fixedElements) {
              const rect = el.getBoundingClientRect();
              if (rect.top === 0 && rect.height > 0) {
                topOffset = Math.max(topOffset, rect.height);
              }
            }
          }

          // 直接滚动到标题位置，减去顶部偏移
          const targetScrollTop = Math.max(0, elementTop - topOffset);

          console.log("[useScrollCategory] 检测到的顶部偏移:", topOffset);
          console.log("[useScrollCategory] 目标滚动位置:", targetScrollTop);
          console.log(
            "[useScrollCategory] 滚动方向:",
            targetScrollTop > containerScrollTop ? "向下" : "向上"
          );

          scrollContainer.value.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });

          console.log("[useScrollCategory] 滚动命令已发送");
          console.log("[useScrollCategory] ===================");
        } else {
          console.error("[useScrollCategory] 滚动失败 - 元素或容器未找到");
        }
      } else {
        console.error("[useScrollCategory] 分类数据不存在，index:", index);
      }
    });
  };

  /**
   * 重置选择的分类索引
   */
  const resetCategoryIndex = (index = 0) => {
    currentCategoryIndex.value = index;
    currentCategoryScrollId.value = "";
  };

  /**
   * 强制更新当前视图中的分类
   */
  const forceUpdateCurrentCategory = () => {
    if (!categories.value || categories.value.length === 0) return;
    // 检查是否在客户端环境
    if (typeof document === "undefined") return;

    nextTick(() => {
      const scrollElement = scrollContainer?.value;
      const scrollTop = scrollElement ? scrollElement.scrollTop : 0;
      calculateCurrentCategory(scrollTop);
    });
  };

  // 组件销毁前清除定时器
  onBeforeUnmount(() => {
    if (scrollLockTimeout) {
      clearTimeout(scrollLockTimeout);
      scrollLockTimeout = null;
    }
  });

  return {
    currentCategoryIndex,
    currentCategoryScrollId,
    isScrollLocked,
    isManualScrolling,
    onProductScroll,
    handleCategorySelect,
    resetCategoryIndex,
    calculateCurrentCategory,
    forceUpdateCurrentCategory,
  };
}
