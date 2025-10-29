import React, { useState, useEffect, useRef, useMemo } from 'react';

const Home = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const particlesRef = useRef([]);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(0);

  const targetMousePos = useRef({ x: 0, y: 0 });
  const currentMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    const smoothMouseTracking = () => {
      currentMousePos.current.x = lerp(currentMousePos.current.x, targetMousePos.current.x, 0.08);
      currentMousePos.current.y = lerp(currentMousePos.current.y, targetMousePos.current.y, 0.08);
      setMousePos({ ...currentMousePos.current });
      requestAnimationFrame(smoothMouseTracking);
    };

    smoothMouseTracking();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      { color: 'rgba(59, 130, 246, 0.7)', glow: 'rgba(59, 130, 246, 0.3)' },
      { color: 'rgba(139, 92, 246, 0.7)', glow: 'rgba(139, 92, 246, 0.3)' },
      { color: 'rgba(6, 182, 212, 0.7)', glow: 'rgba(6, 182, 212, 0.3)' },
      { color: 'rgba(168, 85, 247, 0.7)', glow: 'rgba(168, 85, 247, 0.3)' }
    ];

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 50; i++) {
        const colorSet = colors[i % colors.length];
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: Math.random() * 1.2 + 0.8,
          color: colorSet.color,
          glow: colorSet.glow,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }

    let time = 0;
    
    const animate = () => {
      time += 0.01;
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        const dx = currentMousePos.current.x - particle.x;
        const dy = currentMousePos.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180 * 0.012;
          particle.vx += (dx / dist) * force;
          particle.vy += (dy / dist) * force;
        }

        particle.vx *= 0.99;
        particle.vy *= 0.99;

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;

        const pulse = Math.sin(time + particle.pulseOffset) * 0.3 + 1;
        const currentRadius = particle.radius * pulse;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.glow;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < Math.min(i + 6, particlesRef.current.length); j++) {
          const other = particlesRef.current[j];
          const dx2 = particle.x - other.x;
          const dy2 = particle.y - other.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < 100) {
            const opacity = (1 - dist2 / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleMouseMove = (e) => {
      targetMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollProgress = Math.min(scrollY / viewportHeight, 1);

  const projects = useMemo(() => [
    { 
      id: 1, 
      title: 'Enterprise Platform', 
      impact: 'Increased efficiency by 40%',
      tech: 'React • Node.js • PostgreSQL', 
      color: 'from-blue-500 to-cyan-500', 
      icon: '🚀',
      metrics: '10k+ daily users'
    },
    { 
      id: 2, 
      title: 'Real-time Collaboration Tool', 
      impact: 'Reduced meeting time by 60%',
      tech: 'WebSocket • Redis • React', 
      color: 'from-purple-500 to-pink-500', 
      icon: '🤝',
      metrics: '<50ms latency'
    },
    { 
      id: 3, 
      title: 'Data Analytics Dashboard', 
      impact: 'Automated 100+ reports',
      tech: 'Python • D3.js • AWS', 
      color: 'from-emerald-500 to-teal-500', 
      icon: '📊',
      metrics: '1M+ data points'
    },
    { 
      id: 4, 
      title: 'Mobile Application', 
      impact: 'Featured in App Store',
      tech: 'React Native • Firebase', 
      color: 'from-orange-500 to-amber-500', 
      icon: '📱',
      metrics: '50k+ downloads'
    },
    { 
      id: 5, 
      title: 'Cloud Infrastructure', 
      impact: 'Reduced costs by 60%',
      tech: 'AWS • Docker • Kubernetes', 
      color: 'from-indigo-500 to-blue-500', 
      icon: '☁️',
      metrics: 'Auto-scaling'
    },
    { 
      id: 6, 
      title: 'E-commerce Platform', 
      impact: '1M+ transactions processed',
      tech: 'Next.js • Stripe • MongoDB', 
      color: 'from-violet-500 to-purple-500', 
      icon: '🛍️',
      metrics: '99.9% uptime'
    }
  ], []);

  const skills = useMemo(() => ({
    expert: [
      { name: 'React', level: 95, category: 'Frontend' },
      { name: 'TypeScript', level: 92, category: 'Language' },
      { name: 'Node.js', level: 90, category: 'Backend' }
    ],
    advanced: [
      { name: 'Python', level: 88, category: 'Language' },
      { name: 'AWS', level: 85, category: 'Cloud' },
      { name: 'Docker', level: 87, category: 'DevOps' },
      { name: 'PostgreSQL', level: 84, category: 'Database' },
      { name: 'GraphQL', level: 86, category: 'API' },
      { name: 'Kubernetes', level: 80, category: 'Orchestration' }
    ]
  }), []);

  return (
    <div className="relative bg-slate-950 text-white overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #8b5cf6, #06b6d4);
          border-radius: 4px;
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, #1e1b4b, #0f172a)' }}
      />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-5 pointer-events-none">
            <div className="absolute inset-0 border border-purple-500 rounded-full"
                 style={{ animation: 'pulse 4s ease-in-out infinite' }} />
            <div className="absolute inset-8 border border-cyan-500 rounded-full"
                 style={{ animation: 'pulse 4s ease-in-out infinite 0.5s' }} />
            <div className="absolute inset-16 border border-blue-500 rounded-full"
                 style={{ animation: 'pulse 4s ease-in-out infinite 1s' }} />
          </div>

          <div className="text-center">
            <div 
              className="inline-block mb-8 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-xl rounded-full border border-purple-500/30 shadow-lg shadow-purple-500/20"
              style={{
                transform: `translateY(${Math.sin(scrollY * 0.003) * 5}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <span className="text-purple-200 text-sm font-medium tracking-wider">
                ⚡ PROFESSIONAL DEVELOPER
              </span>
            </div>
            
            <h1 
              className="text-8xl md:text-9xl font-black mb-6 tracking-tight"
              style={{ 
                lineHeight: 0.95,
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 40%, #ec4899 70%, #06b6d4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 80px rgba(168, 85, 247, 0.3)'
              }}
            >
              Your Name
            </h1>
            
            <p 
              className="text-2xl md:text-3xl text-gray-300 mb-4 font-light leading-relaxed max-w-4xl mx-auto"
              style={{ opacity: 0.9 }}
            >
              Building <span className="text-cyan-400 font-semibold">exceptional experiences</span> through 
              <span className="text-purple-400 font-semibold"> innovative solutions</span> and 
              <span className="text-pink-400 font-semibold"> clean code</span>
            </p>

            <div className="flex flex-wrap gap-6 justify-center mb-12 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span><strong className="text-white">8+</strong> years experience</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span><strong className="text-white">50+</strong> projects delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span><strong className="text-white">99.9%</strong> client satisfaction</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 justify-center items-center">
              <a
                href="#projects"
                className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transform"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View My Work
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              
              <a
                href="#contact"
                className="px-10 py-5 bg-white/5 backdrop-blur-xl rounded-2xl font-semibold text-lg border-2 border-white/20 hover:bg-white/10 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 transform"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>

        <div 
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
          style={{
            animation: 'fadeInUp 1s ease-out 1.5s forwards',
            opacity: 0
          }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
            <span>Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-gray-500/50 rounded-full flex items-start justify-center p-2 animate-pulse">
              <div className="w-1 h-2 bg-gray-500/50 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="relative py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div>
                <div className="inline-block px-5 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-6">
                  <span className="text-cyan-300 text-sm font-semibold tracking-wide">ABOUT ME</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                  Turning ideas into
                  <br />
                  <span className="text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text">
                    impactful solutions
                  </span>
                </h2>
              </div>
              
              <div className="space-y-6 text-xl text-gray-300 leading-relaxed">
                <p>
                  I'm a <strong className="text-white">full-stack developer</strong> who loves building things that make a difference. 
                  Whether it's a <strong className="text-white">web application</strong>, mobile app, or cloud infrastructure—I focus on 
                  creating solutions that are both beautiful and functional.
                </p>
                
                <p className="text-lg text-gray-400">
                  With <strong className="text-cyan-400">8+ years</strong> of experience across startups and enterprises, 
                  I've delivered products that serve <strong className="text-white">millions of users</strong> and drive 
                  <strong className="text-white"> measurable business results</strong>.
                </p>

                <p className="text-lg text-gray-400">
                  I believe great software is about understanding people, solving real problems, and never stopping to learn and improve.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                {[
                  { icon: '🎯', text: 'Problem Solver', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40' },
                  { icon: '💡', text: 'Creative Thinker', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40' },
                  { icon: '🚀', text: 'Fast Learner', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40' }
                ].map((badge, idx) => (
                  <div 
                    key={idx}
                    className={`px-6 py-3 bg-gradient-to-r ${badge.color} backdrop-blur-sm rounded-xl border text-base font-medium hover:scale-105 transition-transform cursor-default`}
                  >
                    <span className="mr-2">{badge.icon}</span>
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div 
                className="sticky top-24 bg-gradient-to-br from-purple-900/40 to-cyan-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl"
                style={{
                  transform: `translateY(${scrollProgress * 30}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <div className="absolute inset-0 opacity-5 overflow-hidden rounded-3xl">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border border-purple-400/50"
                      style={{
                        width: `${100 - i * 12}%`,
                        height: `${100 - i * 12}%`,
                        top: `${i * 6}%`,
                        left: `${i * 6}%`,
                        transform: `rotate(${i * 15}deg)`,
                        borderRadius: '30%'
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 space-y-8">
                  {[
                    { value: '8+', label: 'Years of Experience', subtext: 'Building & Shipping' },
                    { value: '50+', label: 'Projects Completed', subtext: 'From Concept to Launch' },
                    { value: '99.9%', label: 'Client Satisfaction', subtext: 'Happy Clients' },
                    { value: '10M+', label: 'Users Reached', subtext: 'Across Platforms' }
                  ].map((stat, idx) => (
                    <div key={idx} className="border-b border-white/10 last:border-0 pb-6 last:pb-0">
                      <div className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-2">
                        {stat.value}
                      </div>
                      <div className="text-white font-semibold mb-1">{stat.label}</div>
                      <div className="text-sm text-gray-400">{stat.subtext}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="relative py-40 px-6 bg-gradient-to-b from-black/0 via-black/30 to-black/0">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-purple-500/10 rounded-full border border-purple-500/30 mb-6">
              <span className="text-purple-300 text-sm font-semibold tracking-wide">SKILLS & EXPERTISE</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              What I <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">Bring to the Table</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A diverse skill set covering the full technology stack
            </p>
          </div>

          <div className="space-y-16">
            <div>
              <h3 className="text-2xl font-bold mb-8 text-cyan-400 flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                Core Expertise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {skills.expert.map((skill, idx) => (
                  <div
                    key={skill.name}
                    className="group relative bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/30 p-8 hover:border-cyan-400/60 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
                    onMouseEnter={() => setHoveredSkill(skill.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    style={{
                      animation: `scaleIn 0.6s ease-out ${idx * 0.15}s forwards`,
                      opacity: 0
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/20 group-hover:to-purple-500/20 transition-all duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          {skill.category}
                        </span>
                        <div className="text-3xl font-black text-white">{skill.level}%</div>
                      </div>
                      
                      <h4 className="text-3xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                        {skill.name}
                      </h4>
                      
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: hoveredSkill === skill.name ? `${skill.level}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-8 text-purple-400 flex items-center gap-3">
                <span className="text-3xl">💎</span>
                Additional Skills
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {skills.advanced.map((skill, idx) => (
                  <div
                    key={skill.name}
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-110 cursor-pointer"
                    onMouseEnter={() => setHoveredSkill(skill.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${idx * 0.08}s forwards`,
                      opacity: 0
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">{skill.level}%</div>
                      <div className="text-sm font-semibold text-white mb-1">{skill.name}</div>
                      <div className="text-xs text-gray-400">{skill.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="relative py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-6">
              <span className="text-cyan-300 text-sm font-semibold tracking-wide">PORTFOLIO</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text">
                Featured
              </span>
              {' '}Projects
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Real-world projects with measurable impact and proven results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.12}s forwards`,
                  opacity: 0
                }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div className="relative h-96 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-500 cursor-pointer group-hover:scale-[1.02] group-hover:shadow-2xl">
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-15 transition-all duration-500`} />
                  
                  <div className="absolute inset-0 opacity-[0.02]">
                    <svg className="w-full h-full">
                      <pattern id={`grid-${project.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="1" fill="white" />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#grid-${project.id})`} />
                    </svg>
                  </div>

                  <div className="relative z-10 p-8 h-full flex flex-col">
                    <div 
                      className="text-6xl mb-4 transform transition-all duration-500 group-hover:scale-110"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))'
                      }}
                    >
                      {project.icon}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                        {project.title}
                      </h3>
                      
                      <p className="text-cyan-400 font-semibold mb-3 text-sm">
                        ✨ {project.impact}
                      </p>
                      
                      <p className="text-gray-400 text-sm mb-4">{project.tech}</p>
                      
                      <div className="inline-block px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-300">
                        📈 {project.metrics}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${project.color} transform origin-left transition-all duration-700 ease-out`}
                          style={{
                            transform: hoveredProject === project.id ? 'scaleX(1)' : 'scaleX(0)'
                          }}
                        />
                      </div>
                    </div>

                    <div 
                      className={`absolute bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br ${project.color} flex items-center justify-center transform transition-all duration-300 shadow-lg ${hoveredProject === project.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                    >
                      <span className="text-white text-2xl font-bold">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400 text-lg mb-6">
              Each project represents <span className="text-white font-semibold">dedication to quality</span>, 
              thorough planning, and <span className="text-white font-semibold">successful delivery</span>
            </p>
            <a 
              href="#contact"
              className="inline-block px-8 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/10 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 font-semibold"
            >
              Want to see more? Let's connect →
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="relative py-40 px-6 bg-gradient-to-b from-black/0 via-black/40 to-black/0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-purple-500/10 rounded-full border border-purple-500/30 mb-6">
              <span className="text-purple-300 text-sm font-semibold tracking-wide">TESTIMONIALS</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              What People <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "One of the best developers I've worked with. Delivers quality work on time, every time.",
                author: "Sarah Chen",
                role: "Product Manager, TechCorp",
                color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/30"
              },
              {
                quote: "Incredible problem-solving skills. Turned our complex requirements into an elegant solution.",
                author: "Michael Rodriguez",
                role: "CTO, StartupXYZ",
                color: "from-purple-500/10 to-pink-500/10 border-purple-500/30"
              },
              {
                quote: "A pleasure to work with. Great communication, technical expertise, and positive attitude.",
                author: "Emily Watson",
                role: "Founder, DesignCo",
                color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${testimonial.color} backdrop-blur-xl rounded-3xl border p-8 hover:scale-105 transition-transform duration-300`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.2}s forwards`,
                  opacity: 0
                }}
              >
                <div className="text-4xl mb-6 opacity-30">"</div>
                <p className="text-gray-300 mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="border-t border-white/10 pt-6">
                  <div className="font-bold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-6">
              <span className="text-cyan-300 text-sm font-semibold tracking-wide">LET'S WORK TOGETHER</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Ready to Start
              <br />
              <span className="text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text">
                Your Next Project?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
              Whether you need a developer, consultant, or technical partner—
              <span className="text-white font-semibold"> I'm here to help bring your ideas to life</span>
            </p>

            <a
              href="mailto:hello@example.com"
              className="inline-block px-12 py-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl font-bold text-xl mb-12 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 transform"
            >
              📧 hello@example.com
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'LinkedIn', icon: '💼', url: '#', color: 'from-blue-500 to-indigo-500' },
              { name: 'GitHub', icon: '⚡', url: '#', color: 'from-purple-500 to-pink-500' },
              { name: 'Twitter', icon: '🐦', url: '#', color: 'from-cyan-500 to-blue-500' },
              { name: 'Calendar', icon: '📅', url: '#', color: 'from-emerald-500 to-teal-500' }
            ].map((contact, idx) => (
              <a
                key={idx}
                href={contact.url}
                className="group relative aspect-square bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col items-center justify-center hover:scale-110 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${contact.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {contact.icon}
                  </div>
                  <span className="text-sm font-semibold">{contact.name}</span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              ⚡ Typically respond within <span className="text-white font-semibold">24 hours</span>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="font-bold text-xl text-white mb-2">Your Name</p>
              <p className="text-gray-400 text-sm">
                Built with React • Designed for Impact
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-gray-400 items-center justify-center">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <span>•</span>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2025 Your Name. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;