/**
 * Hero 组件
 * 功能：首屏展示区域，包含标题、副标题和描述，带有鼠标跟随黑色圆形效果和行星碰撞
 * 设计风格：极简主义、极致留白
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// 技能行星配置
const planetsConfig = [
  { name: 'JS', fullName: 'JavaScript', color: '#F7DF1E', textColor: '#000', difficulty: 3, speed: 40 },
  { name: 'PY', fullName: 'Python', color: '#3776AB', textColor: '#fff', difficulty: 3, speed: 44 },
  { name: 'HTML', fullName: 'HTML', color: '#E34F26', textColor: '#fff', difficulty: 1, speed: 36 },
  { name: 'CSS', fullName: 'CSS', color: '#1572B6', textColor: '#fff', difficulty: 2, speed: 38 },
  { name: 'TS', fullName: 'TypeScript', color: '#3178C6', textColor: '#fff', difficulty: 5, speed: 50 },
  { name: 'GO', fullName: 'Golang', color: '#00ADD8', textColor: '#fff', difficulty: 6, speed: 54 },
  { name: 'VUE', fullName: 'Vue', color: '#42B883', textColor: '#fff', difficulty: 4, speed: 48 },
  { name: 'RCT', fullName: 'React', color: '#61DAFB', textColor: '#000', difficulty: 5, speed: 52 },
  { name: 'NODE', fullName: 'Node.js', color: '#339933', textColor: '#fff', difficulty: 4, speed: 46 },
  { name: 'TW', fullName: 'Tailwind', color: '#06B6D4', textColor: '#fff', difficulty: 2, speed: 42 },
  { name: 'DKR', fullName: 'Docker', color: '#2496ED', textColor: '#fff', difficulty: 5, speed: 56 },
  { name: 'GIT', fullName: 'Git', color: '#F05032', textColor: '#fff', difficulty: 3, speed: 44 },
  { name: 'NXT', fullName: 'Next.js', color: '#000000', textColor: '#fff', difficulty: 6, speed: 58 },
  { name: 'RS', fullName: 'Rust', color: '#000000', textColor: '#fff', difficulty: 9, speed: 70 },
  { name: 'C++', fullName: 'C++', color: '#00599C', textColor: '#fff', difficulty: 8, speed: 66 },
  { name: 'SQL', fullName: 'SQL', color: '#4479A1', textColor: '#fff', difficulty: 4, speed: 48 },
];

interface Planet {
  id: number;
  name: string;
  color: string;
  textColor: string;
  size: number;
  fontSize: number;
  spinSpeed: number;
  mass: number; // 质量，基于大小
  // 轨道参数
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  // 物理参数
  x: number;
  y: number;
  vx: number;
  vy: number;
  isColliding: boolean;
  returnProgress: number; // 回到轨道的进度 0-1
  collisionCooldown: number; // 碰撞冷却时间（帧数）
}

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [detectionRadius, setDetectionRadius] = useState(0);
  const [textLayerCenter, setTextLayerCenter] = useState({ x: 0, y: 0 }); // 缓存文字层中心位置
  const [planets, setPlanets] = useState<Planet[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number>(0);

  // 黑色圆形的固定半径
  const circleRadius = 100;

  // 根据难度计算行星大小
  const getPlanetSize = (difficulty: number) => {
    return 20 + (difficulty / 10) * 30;
  };

  // 根据公转速度计算自转速度
  const getSpinSpeed = (orbitSpeed: number) => {
    if (orbitSpeed < 23) return 3;
    if (orbitSpeed < 28) return 5;
    return 8;
  };

  useEffect(() => {
    // 计算触发范围的圆形半径
    const calculateDetectionRadius = () => {
      if (textLayerRef.current && contentRef.current) {
        // 使用 offsetWidth/offsetHeight 获取未缩放的尺寸
        const width = textLayerRef.current.offsetWidth;
        const height = textLayerRef.current.offsetHeight;
        const diagonal = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        const radius = diagonal / 2; // 移除了 +100，现在直接使用对角线的一半
        setDetectionRadius(radius);
        
        // 缓存文字层中心位置，避免每次渲染都计算
        const textRect = textLayerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        setTextLayerCenter({
          x: textRect.left - contentRect.left + textRect.width / 2,
          y: textRect.top - contentRect.top + textRect.height / 2,
        });
        
        // 初始化或更新行星轨道半径
        if (planets.length === 0) {
          // 初始化行星
          const initialPlanets: Planet[] = planetsConfig.map((config, index) => {
            const size = getPlanetSize(config.difficulty);
            const angle = (index / planetsConfig.length) * Math.PI * 2;
            const mass = Math.pow(size / 20, 2);
            
            const layer = Math.floor(index / 4);
            const layerOffset = layer * 30;
            const orbitRadius = radius + layerOffset - 45;
            
            return {
              id: index,
              name: config.name,
              color: config.color,
              textColor: config.textColor,
              size,
              mass,
              fontSize: Math.max(6, Math.floor(size / 4)),
              spinSpeed: getSpinSpeed(config.speed),
              orbitRadius: orbitRadius,
              orbitSpeed: config.speed,
              orbitAngle: angle,
              x: Math.cos(angle) * orbitRadius,
              y: Math.sin(angle) * orbitRadius,
              vx: 0,
              vy: 0,
              isColliding: false,
              returnProgress: 1,
              collisionCooldown: 0,
            };
          });
          setPlanets(initialPlanets);
        } else {
          // 更新现有行星的轨道半径
          setPlanets(prevPlanets => 
            prevPlanets.map((planet, index) => {
              const layer = Math.floor(index / 4);
              const layerOffset = layer * 30;
              const newOrbitRadius = radius + layerOffset - 45;
              
              // 如果行星在正常轨道上，更新位置
              if (!planet.isColliding) {
                return {
                  ...planet,
                  orbitRadius: newOrbitRadius,
                  x: Math.cos(planet.orbitAngle) * newOrbitRadius,
                  y: Math.sin(planet.orbitAngle) * newOrbitRadius,
                };
              }
              // 如果行星在碰撞状态，只更新轨道半径
              return {
                ...planet,
                orbitRadius: newOrbitRadius,
              };
            })
          );
        }
      }
    };

    calculateDetectionRadius();
    window.addEventListener('resize', calculateDetectionRadius);

    return () => {
      window.removeEventListener('resize', calculateDetectionRadius);
    };
  }, [planets.length]);

  useEffect(() => {
    let rafId: number | null = null;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (contentRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect();
        lastMouseX = e.clientX - contentRect.left;
        lastMouseY = e.clientY - contentRect.top;
        
        // 使用 requestAnimationFrame 节流，避免过于频繁的状态更新
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            setMousePosition({ x: lastMouseX, y: lastMouseY });
            rafId = null;
          });
        }
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
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // 物理引擎 - 碰撞检测和更新
  useEffect(() => {
    if (planets.length === 0 || detectionRadius === 0) return;

    const updatePhysics = (currentTime: number) => {
      // 限制更新频率为 30fps，减少性能消耗
      if (currentTime - lastUpdateTimeRef.current < 33) {
        animationFrameRef.current = requestAnimationFrame(updatePhysics);
        return;
      }
      lastUpdateTimeRef.current = currentTime;

      setPlanets(prevPlanets => {
        const newPlanets = [...prevPlanets];
        const dt = 0.033; // 30fps

        // 更新轨道角度和位置
        newPlanets.forEach(planet => {
          // 更新碰撞冷却时间
          if (planet.collisionCooldown > 0) {
            planet.collisionCooldown--;
          }

          if (planet.isColliding) {
            // 碰撞后，继续更新轨道角度（行星继续"公转"）
            planet.orbitAngle += (Math.PI * 2) / (planet.orbitSpeed * 60);
            
            // 应用速度移动
            planet.x += planet.vx * dt * 60;
            planet.y += planet.vy * dt * 60;
            
            // 摩擦力（空间阻力）
            planet.vx *= 0.99;
            planet.vy *= 0.99;
            
            // 计算当前轨道位置（行星应该在的位置）
            const targetX = Math.cos(planet.orbitAngle) * planet.orbitRadius;
            const targetY = Math.sin(planet.orbitAngle) * planet.orbitRadius;
            
            // 计算到轨道的距离
            const toOrbitX = targetX - planet.x;
            const toOrbitY = targetY - planet.y;
            const distanceToOrbit = Math.sqrt(toOrbitX * toOrbitX + toOrbitY * toOrbitY);
            
            // 逐渐增加回归进度
            planet.returnProgress += 0.008;
            
            // 当速度足够小且回归进度足够时，开始施加"引力"
            const currentSpeed = Math.sqrt(planet.vx * planet.vx + planet.vy * planet.vy);
            if (planet.returnProgress > 0.2 && currentSpeed < 3) {
              // 施加向轨道的引力
              const gravityStrength = 0.15 * planet.returnProgress;
              if (distanceToOrbit > 0.1) {
                const gravityX = (toOrbitX / distanceToOrbit) * gravityStrength;
                const gravityY = (toOrbitY / distanceToOrbit) * gravityStrength;
                
                planet.vx += gravityX;
                planet.vy += gravityY;
              }
            }
            
            // 强制回归条件：如果卡住太久，直接回到轨道
            if (planet.returnProgress >= 1.5) {
              planet.isColliding = false;
              planet.returnProgress = 1;
              planet.x = targetX;
              planet.y = targetY;
              planet.vx = 0;
              planet.vy = 0;
            }
            // 正常回归条件：接近轨道且速度小
            else if (distanceToOrbit < 15 && currentSpeed < 0.8) {
              planet.isColliding = false;
              planet.returnProgress = 1;
              planet.x = targetX;
              planet.y = targetY;
              planet.vx = 0;
              planet.vy = 0;
            }
          } else {
            // 正常轨道运行
            planet.orbitAngle += (Math.PI * 2) / (planet.orbitSpeed * 60);
            const targetX = Math.cos(planet.orbitAngle) * planet.orbitRadius;
            const targetY = Math.sin(planet.orbitAngle) * planet.orbitRadius;
            planet.x = targetX;
            planet.y = targetY;
          }
        });

        // 碰撞检测
        for (let i = 0; i < newPlanets.length; i++) {
          for (let j = i + 1; j < newPlanets.length; j++) {
            const p1 = newPlanets[i];
            const p2 = newPlanets[j];
            
            // 如果两个行星都在冷却时间内，跳过碰撞检测（避免重复碰撞）
            if (p1.collisionCooldown > 0 && p2.collisionCooldown > 0) continue;
            
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (p1.size + p2.size) / 2;

            if (distance < minDistance) {
              // 防止距离为0导致的除零错误
              if (distance < 0.1) {
                // 如果完全重叠，给一个随机方向
                const randomAngle = Math.random() * Math.PI * 2;
                p1.x += Math.cos(randomAngle) * 10;
                p1.y += Math.sin(randomAngle) * 10;
                p2.x -= Math.cos(randomAngle) * 10;
                p2.y -= Math.sin(randomAngle) * 10;
                continue;
              }

              // 发生碰撞
              p1.isColliding = true;
              p2.isColliding = true;
              p1.returnProgress = 0;
              p2.returnProgress = 0;
              p1.collisionCooldown = 10; // 设置冷却时间为 10 帧（约 0.33 秒）
              p2.collisionCooldown = 10;

              // 碰撞方向单位向量
              const nx = dx / distance;
              const ny = dy / distance;

              // 弹性碰撞系数
              const restitution = 0.5; // 降低弹性，减少碰撞后的速度

              // 计算碰撞冲量（降低基础速度）
              const relativeVelocity = 1.0; // 降低基础相对速度，从 2.0 降到 1.0
              const totalMass = p1.mass + p2.mass;
              
              // 根据质量分配速度（质量小的获得更大速度）
              const v1 = relativeVelocity * (p2.mass / totalMass) * (1 + restitution);
              const v2 = relativeVelocity * (p1.mass / totalMass) * (1 + restitution);
              
              // 施加碰撞速度
              p1.vx = -nx * v1;
              p1.vy = -ny * v1;
              p2.vx = nx * v2;
              p2.vy = ny * v2;

              // 添加径向速度分量（向内或向外）
              const p1Angle = Math.atan2(p1.y, p1.x);
              const p2Angle = Math.atan2(p2.y, p2.x);
              
              const collisionAngle = Math.atan2(dy, dx);
              const p1RadialAngle = collisionAngle - p1Angle;
              const p2RadialAngle = collisionAngle - p2Angle;
              
              const radialForce = 0.8; // 降低径向力，从 1.5 降到 0.8
              
              p1.vx += Math.cos(p1Angle) * radialForce * Math.sin(p1RadialAngle) / p1.mass;
              p1.vy += Math.sin(p1Angle) * radialForce * Math.sin(p1RadialAngle) / p1.mass;
              
              p2.vx += Math.cos(p2Angle) * radialForce * Math.sin(p2RadialAngle) / p2.mass;
              p2.vy += Math.sin(p2Angle) * radialForce * Math.sin(p2RadialAngle) / p2.mass;

              // 添加随机扰动
              const randomAngle = Math.random() * Math.PI * 2;
              const randomForce = 0.15; // 降低随机扰动，从 0.3 降到 0.15
              p1.vx += Math.cos(randomAngle) * randomForce;
              p1.vy += Math.sin(randomAngle) * randomForce;
              p2.vx += Math.cos(randomAngle + Math.PI) * randomForce;
              p2.vy += Math.sin(randomAngle + Math.PI) * randomForce;

              // 限制速度上限
              const maxSpeed = 5; // 降低最大速度，从 10 降到 5
              const p1Speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
              if (p1Speed > maxSpeed) {
                p1.vx = (p1.vx / p1Speed) * maxSpeed;
                p1.vy = (p1.vy / p1Speed) * maxSpeed;
              }
              const p2Speed = Math.sqrt(p2.vx * p2.vx + p2.vy * p2.vy);
              if (p2Speed > maxSpeed) {
                p2.vx = (p2.vx / p2Speed) * maxSpeed;
                p2.vy = (p2.vy / p2Speed) * maxSpeed;
              }

              // 立即分离行星，避免重叠
              const overlap = minDistance - distance;
              const totalInverseMass = 1 / p1.mass + 1 / p2.mass;
              const separateRatio1 = (1 / p1.mass) / totalInverseMass;
              const separateRatio2 = (1 / p2.mass) / totalInverseMass;
              
              // 增加分离力度
              const separationMultiplier = 1.2;
              p1.x -= nx * overlap * separateRatio2 * separationMultiplier;
              p1.y -= ny * overlap * separateRatio2 * separationMultiplier;
              p2.x += nx * overlap * separateRatio1 * separationMultiplier;
              p2.y += ny * overlap * separateRatio1 * separationMultiplier;
            }
          }
        }

        return newPlanets;
      });

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [planets.length, detectionRadius]);

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
        {/* 星轨效果 - 轨道和行星共用同一个中心 */}
        {detectionRadius > 0 && (
          <div
            className="pointer-events-none absolute z-5"
            style={{
              left: '50%',
              top: '50%',
              width: 0,
              height: 0,
            }}
          >
            {/* 主轨道 - 多层 */}
            {[0, 1, 2, 3].map((layer) => {
              const radius = detectionRadius - 45 + layer * 30;
              return (
                <div
                  key={layer}
                  className="absolute rounded-full"
                  style={{
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                    left: `-${radius}px`,
                    top: `-${radius}px`,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.03)',
                  }}
                />
              );
            })}
            
            {/* 旋转的虚线轨道 - 最外层 */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${detectionRadius * 2}px`,
                height: `${detectionRadius * 2}px`,
                left: `-${detectionRadius}px`,
                top: `-${detectionRadius}px`,
                border: '1px dashed rgba(0, 0, 0, 0.2)',
                animation: 'spin 30s linear infinite',
              }}
            />
            
            {/* 内层光晕 */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${(detectionRadius - 50) * 2}px`,
                height: `${(detectionRadius - 50) * 2}px`,
                left: `-${detectionRadius - 50}px`,
                top: `-${detectionRadius - 50}px`,
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            />

            {/* 技能行星 - 带碰撞效果 */}
            {planets.map((planet) => {
              return (
                <div
                  key={planet.id}
                  className="absolute"
                  style={{
                    left: `${planet.x - planet.size / 2}px`,
                    top: `${planet.y - planet.size / 2}px`,
                    transition: planet.isColliding ? 'none' : 'left 0.1s linear, top 0.1s linear',
                    willChange: 'left, top',
                    transform: 'translateZ(0)', // 启用 GPU 加速
                  }}
                >
                  <div
                    className="rounded-full shadow-lg flex items-center justify-center font-bold select-none"
                    style={{
                      width: `${planet.size}px`,
                      height: `${planet.size}px`,
                      backgroundColor: planet.color,
                      color: planet.textColor,
                      fontSize: `${planet.fontSize}px`,
                      animation: `spin-fast ${planet.spinSpeed}s linear infinite`,
                      willChange: 'transform',
                    }}
                  >
                    {planet.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 正常文字层 - 缩放到 80% */}
        <div 
          ref={textLayerRef} 
          className="relative z-10 select-none"
          style={{
            transform: 'scale(0.8)',
            transformOrigin: 'center center',
          }}
        >
          <h1 className="mb-6 text-center text-7xl font-bold tracking-tight text-[#1D1D1F] md:text-8xl">
            Nexus
          </h1>
          <p className="mb-4 text-center text-2xl font-medium text-[#1D1D1F] md:text-3xl">
            技术探索者 / 工业软件专家
          </p>
          <p className="text-center text-lg leading-relaxed text-[#1D1D1F]/70 md:text-xl">
            深耕工业自动化与前沿 Web 技术，致力于用代码连接物理世界与数字世界
          </p>
        </div>

        {/* 黑色圆形遮罩层 */}
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            clipPath: detectionRadius > 0
              ? `circle(${detectionRadius + 45}px at ${textLayerCenter.x}px ${textLayerCenter.y}px)`
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
                  transform: 'scale(0.8)',
                  transformOrigin: 'center center',
                }}
              >
                <h1 className="mb-6 text-center text-7xl font-bold tracking-tight md:text-8xl">
                  Nexus
                </h1>
                <p className="mb-4 text-center text-2xl font-medium md:text-3xl">
                  技术探索者 / 工业软件专家
                </p>
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
