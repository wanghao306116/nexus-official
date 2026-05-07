/**
 * Hero 组件
 * 功能：首屏展示区域，包含标题、副标题和描述，带有鼠标跟随黑色圆形效果
 * 设计风格：极简主义、极致留白
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// 技能行星配置
const planets = [
  // 难度: 1-10 (决定大小), 速度: 公转周期(秒)
  { name: 'JS', fullName: 'JavaScript', color: '#F7DF1E', textColor: '#000', difficulty: 3, speed: 20 },
  { name: 'PY', fullName: 'Python', color: '#3776AB', textColor: '#fff', difficulty: 3, speed: 22 },
  { name: 'HTML', fullName: 'HTML', color: '#E34F26', textColor: '#fff', difficulty: 1, speed: 18 },
  { name: 'CSS', fullName: 'CSS', color: '#1572B6', textColor: '#fff', difficulty: 2, speed: 19 },
  { name: 'TS', fullName: 'TypeScript', color: '#3178C6', textColor: '#fff', difficulty: 5, speed: 25 },
  { name: 'GO', fullName: 'Golang', color: '#00ADD8', textColor: '#fff', difficulty: 6, speed: 27 },
  { name: 'VUE', fullName: 'Vue', color: '#42B883', textColor: '#fff', difficulty: 4, speed: 24 },
  { name: 'RCT', fullName: 'React', color: '#61DAFB', textColor: '#000', difficulty: 5, speed: 26 },
  { name: 'NODE', fullName: 'Node.js', color: '#339933', textColor: '#fff', difficulty: 4, speed: 23 },
  { name: 'TW', fullName: 'Tailwind', color: '#06B6D4', textColor: '#fff', difficulty: 2, speed: 21 },
  { name: 'DKR', fullName: 'Docker', color: '#2496ED', textColor: '#fff', difficulty: 5, speed: 28 },
  { name: 'GIT', fullName: 'Git', color: '#F05032', textColor: '#fff', difficulty: 3, speed: 22 },
  { name: 'NXT', fullName: 'Next.js', color: '#000000', textColor: '#fff', difficulty: 6, speed: 29 },
  { name: 'RS', fullName: 'Rust', color: '#000000', textColor: '#fff', difficulty: 9, speed: 35 },
  { name: 'C++', fullName: 'C++', color: '#00599C', textColor: '#fff', difficulty: 8, speed: 33 },
  { name: 'SQL', fullName: 'SQL', color: '#4479A1', textColor: '#fff', difficulty: 4, speed: 24 },
];

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [detectionRadius, setDetectionRadius] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  // 黑色圆形的固定半径
  const circleRadius = 100;

  useEffect(() => {
    // 计算触发范围的圆形半径
    const calculateDetectionRadius = () => {
      if (textLayerRef.current) {
        const rect = textLayerRef.current.getBoundingClientRect();
        // 使用文字区域的对角线长度的一半作为圆形半径，再增加 100px（直径增加 200px）
        const diagonal = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2));
        setDetectionRadius(diagonal / 2 + 100);
      }
    };

    // 初始计算
    calculateDetectionRadius();

    // 窗口大小改变时重新计算
    window.addEventListener('resize', calculateDetectionRadius);

    return () => {
      window.removeEventListener('resize', calculateDetectionRadius);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (contentRef.current && textLayerRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect();
        
        // 计算鼠标相对于内容区域的位置
        const mouseX = e.clientX - contentRect.left;
        const mouseY = e.clientY - contentRect.top;
        
        // 始终更新鼠标位置
        setMousePosition({ x: mouseX, y: mouseY });
      }
    };

    const element = sectionRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [detectionRadius]);

  // 根据难度计算行星大小 (难度1-10 -> 大小20-50px)
  const getPlanetSize = (difficulty: number) => {
    return 20 + (difficulty / 10) * 30;
  };

  // 根据公转速度计算自转速度 (公转越快，自转越快)
  const getSpinSpeed = (orbitSpeed: number) => {
    // 公转速度快的行星自转也快
    if (orbitSpeed < 23) return 3; // 快速自转
    if (orbitSpeed < 28) return 5; // 中速自转
    return 8; // 慢速自转
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-20 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* 主内容区域 */}
      <motion.div
        ref={contentRef}
        className="relative mx-auto flex w-full max-w-4xl flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* 星轨效果 - 黑色神秘风格 */}
        {detectionRadius > 0 && (
          <div
            className="pointer-events-none absolute z-5"
            style={{
              width: `${detectionRadius * 2}px`,
              height: `${detectionRadius * 2}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* 主轨道 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(0, 0, 0, 0.15)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.05)',
              }}
            />
            
            {/* 旋转的虚线轨道 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px dashed rgba(0, 0, 0, 0.25)',
                animation: 'spin 30s linear infinite',
              }}
            />
            
            {/* 内层光晕 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(0, 0, 0, 0.08)',
                transform: 'scale(0.95)',
              }}
            />

            {/* 技能行星 - 动态生成 */}
            {planets.map((planet, index) => {
              const size = getPlanetSize(planet.difficulty);
              const spinSpeed = getSpinSpeed(planet.speed);
              const fontSize = Math.max(6, Math.floor(size / 4));
              
              return (
                <div
                  key={planet.name}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: 0,
                    height: 0,
                    animation: `orbit ${planet.speed}s linear infinite`,
                    animationDelay: `${-(index * planet.speed) / planets.length}s`,
                    '--orbit-radius': `${detectionRadius}px`,
                  } as React.CSSProperties}
                >
                  <div
                    className="rounded-full shadow-lg flex items-center justify-center font-bold select-none absolute"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: planet.color,
                      color: planet.textColor,
                      fontSize: `${fontSize}px`,
                      left: '50%',
                      top: '50%',
                      marginLeft: `-${size / 2}px`,
                      marginTop: `-${size / 2}px`,
                      animation: `spin-fast ${spinSpeed}s linear infinite`,
                    }}
                  >
                    {planet.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 正常文字层 */}
        <div ref={textLayerRef} className="relative z-10 select-none">
          {/* 标题 */}
          <h1 className="mb-6 text-center text-7xl font-bold tracking-tight text-[#1D1D1F] md:text-8xl">
            Nexus
          </h1>

          {/* 副标题 */}
          <p className="mb-4 text-center text-2xl font-medium text-[#1D1D1F] md:text-3xl">
            技术探索者 / 工业软件专家
          </p>

          {/* 描述文字 */}
          <p className="text-center text-lg leading-relaxed text-[#1D1D1F]/70 md:text-xl">
            深耕工业自动化与前沿 Web 技术，致力于用代码连接物理世界与数字世界
          </p>
        </div>

        {/* 黑色圆形遮罩层 - 始终存在，通过圆形遮罩控制可见区域 */}
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            clipPath: detectionRadius > 0
              ? `circle(${detectionRadius}px at ${contentRef.current ? (textLayerRef.current!.getBoundingClientRect().left - contentRef.current.getBoundingClientRect().left + textLayerRef.current!.getBoundingClientRect().width / 2) : 0}px ${contentRef.current ? (textLayerRef.current!.getBoundingClientRect().top - contentRef.current.getBoundingClientRect().top + textLayerRef.current!.getBoundingClientRect().height / 2) : 0}px)`
              : 'circle(0px at 50% 50%)',
          }}
        >
          <div
            className="absolute rounded-full bg-black"
            style={{
              width: `${circleRadius * 2}px`,
              height: `${circleRadius * 2}px`,
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
            }}
          >
            {/* 圆形内的白色文字层 */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-full"
              style={{
                clipPath: `circle(${circleRadius}px at 50% 50%)`,
              }}
            >
              <div
                className="absolute text-white"
                style={{
                  left: `${-mousePosition.x + circleRadius}px`,
                  top: `${-mousePosition.y + circleRadius}px`,
                  width: contentRef.current?.offsetWidth || 0,
                }}
              >
                {/* 标题 */}
                <h1 className="mb-6 text-center text-7xl font-bold tracking-tight md:text-8xl">
                  Nexus
                </h1>

                {/* 副标题 */}
                <p className="mb-4 text-center text-2xl font-medium md:text-3xl">
                  技术探索者 / 工业软件专家
                </p>

                {/* 描述文字 */}
                <p className="text-center text-lg leading-relaxed md:text-xl">
                  深耕工业自动化与前沿 Web 技术，致力于用代码连接物理世界与数字世界
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 滚动提示 */}
      <motion.div
        className="absolute bottom-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[#007AFF]"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
