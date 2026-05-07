/**
 * Nexus 个人官网主页
 * 功能：整合各个页面组件
 * 设计风格：极简主义、阳光通透
 */

import Hero from './components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F5F7]">
      <Hero />
    </div>
  );
}
