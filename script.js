
        // Loader
        let loadProgress = 0;
        const loaderPercentage = document.getElementById('loaderPercentage');
        const loader = document.getElementById('loader');
        
        const loadInterval = setInterval(() => {
            loadProgress += Math.random() * 20;
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(loadInterval);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    initAnimations();
                }, 400);
            }
            loaderPercentage.textContent = Math.floor(loadProgress) + '%';
        }, 150);

        // Custom Cursor (Desktop only)
        if (window.matchMedia('(pointer: fine)').matches) {
            const cursor = document.querySelector('.cursor');
            const cursorDot = document.querySelector('.cursor-dot');
            let mouseX = 0, mouseY = 0;
            let cursorX = 0, cursorY = 0;
            
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                cursorDot.style.left = mouseX + 'px';
                cursorDot.style.top = mouseY + 'px';
            });
            
            function animateCursor() {
                cursorX += (mouseX - cursorX) * 0.15;
                cursorY += (mouseY - cursorY) * 0.15;
                cursor.style.left = cursorX + 'px';
                cursor.style.top = cursorY + 'px';
                requestAnimationFrame(animateCursor);
            }
            animateCursor();
            
            document.querySelectorAll('a, button, .track-card, .tour-item').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
        }

        // Navigation
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile Menu
        const menuToggle = document.getElementById('menuToggle');
        const fullscreenMenu = document.getElementById('fullscreenMenu');
        
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            fullscreenMenu.classList.toggle('active');
            document.body.style.overflow = fullscreenMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        document.querySelectorAll('.fullscreen-menu-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                fullscreenMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Scroll Animations
        function initAnimations() {
            const reveals = document.querySelectorAll('.reveal');
            
            const revealOnScroll = () => {
                reveals.forEach(element => {
                    const windowHeight = window.innerHeight;
                    const elementTop = element.getBoundingClientRect().top;
                    const elementVisible = 100;
                    
                    if (elementTop < windowHeight - elementVisible) {
                        element.classList.add('active');
                    }
                });
            };
            
            window.addEventListener('scroll', revealOnScroll);
            revealOnScroll();
            
            animateStats();
        }

        function animateStats() {
            const stats = document.querySelectorAll('.stat-value[data-count]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        const count = parseInt(target.getAttribute('data-count'));
                        const suffix = target.nextElementSibling.textContent.includes('M') ? 'M+' : 
                                      target.nextElementSibling.textContent.includes('K') ? 'K+' : '+';
                        let current = 0;
                        const increment = count / 40;
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= count) {
                                current = count;
                                clearInterval(timer);
                            }
                            target.textContent = Math.floor(current) + suffix;
                        }, 25);
                        observer.unobserve(target);
                    }
                });
            }, { threshold: 0.5 });
            
            stats.forEach(stat => observer.observe(stat));
        }

        // Music Player
        const tracks = {
            'what-you-want': { title: 'WHAT YOU WANT', duration: 173, color: 'linear-gradient(135deg, #1a1a1a, #8B0000)' },
            'good-4-each-other': { title: 'GOOD 4 EACH OTHER', duration: 195, color: 'linear-gradient(135deg, #0d0d0d, #ff0000)' },
            'never': { title: 'NEVER', duration: 210, color: 'linear-gradient(135deg, #2d0000, #000000)' },
            'black-boy': { title: 'BLACK BOY', duration: 240, color: 'linear-gradient(135deg, #1a0000, #4a0000)' }
        };
        
        let currentTrack = null;
        let isPlaying = false;
        let progress = 0;
        let progressInterval;
        
        const player = document.getElementById('musicPlayer');
        const playerTitle = document.getElementById('playerTitle');
        const playerArt = document.getElementById('playerArt');
        const playBtn = document.getElementById('playBtn');
        const progressFill = document.getElementById('progressFill');
        const progressBar = document.getElementById('progressBar');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');
        
        function playTrack(trackId) {
            const track = tracks[trackId];
            if (!track) return;
            
            document.querySelectorAll('.track-card').forEach(card => {
                card.classList.remove('playing');
                card.style.borderColor = '';
            });
            
            const currentCard = document.querySelector(`[data-track="${trackId}"]`);
            if (currentCard) {
                currentCard.classList.add('playing');
                currentCard.style.borderColor = 'var(--primary)';
            }
            
            currentTrack = trackId;
            playerTitle.textContent = track.title;
            playerArt.innerHTML = `<div style="width: 100%; height: 100%; background: ${track.color};"></div>`;
            totalTimeEl.textContent = formatTime(track.duration);
            progress = 0;
            
            player.classList.add('active');
            isPlaying = true;
            updatePlayButton();
            startProgress();
        }
        
        function playLatest() {
            playTrack('what-you-want');
        }
        
        function closePlayer() {
            player.classList.remove('active');
            isPlaying = false;
            clearInterval(progressInterval);
            updatePlayButton();
            
            document.querySelectorAll('.track-card').forEach(card => {
                card.classList.remove('playing');
                card.style.borderColor = '';
            });
            
            currentTrack = null;
        }
        
        function togglePlay() {
            if (!currentTrack) return;
            isPlaying = !isPlaying;
            updatePlayButton();
            if (isPlaying) {
                startProgress();
            } else {
                clearInterval(progressInterval);
            }
        }
        
        function updatePlayButton() {
            playBtn.innerHTML = isPlaying ? 
                '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' :
                '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        }
        
        function startProgress() {
            clearInterval(progressInterval);
            progressInterval = setInterval(() => {
                progress++;
                const track = tracks[currentTrack];
                if (progress >= track.duration) {
                    nextTrack();
                    return;
                }
                updateProgress();
            }, 1000);
        }
        
        function updateProgress() {
            const track = tracks[currentTrack];
            const percent = (progress / track.duration) * 100;
            progressFill.style.width = percent + '%';
            currentTimeEl.textContent = formatTime(progress);
        }
        
        function seek(event) {
            if (!currentTrack) return;
            const rect = progressBar.getBoundingClientRect();
            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const track = tracks[currentTrack];
            progress = Math.floor(percent * track.duration);
            updateProgress();
        }
        
        let isDragging = false;
        
        progressBar.addEventListener('touchstart', (e) => {
            isDragging = true;
            seek(e);
        }, { passive: true });
        
        progressBar.addEventListener('touchmove', (e) => {
            if (isDragging) seek(e);
        }, { passive: true });
        
        progressBar.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        function previousTrack() {
            if (!currentTrack) return;
            const trackIds = Object.keys(tracks);
            const currentIndex = trackIds.indexOf(currentTrack);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : trackIds.length - 1;
            playTrack(trackIds[prevIndex]);
        }
        
        function nextTrack() {
            if (!currentTrack) return;
            const trackIds = Object.keys(tracks);
            const currentIndex = trackIds.indexOf(currentTrack);
            const nextIndex = currentIndex < trackIds.length - 1 ? currentIndex + 1 : 0;
            playTrack(trackIds[nextIndex]);
        }
        
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        function openVideo() {
            alert('Video player opening...');
        }
        
        function handleSubscribe(e) {
            e.preventDefault();
            const btn = e.target.querySelector('.newsletter-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Subscribed!';
            btn.style.background = 'var(--primary)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                e.target.reset();
            }, 2000);
        }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && currentTrack) {
                e.preventDefault();
                togglePlay();
            }
            if (e.code === 'Escape' && player.classList.contains('active')) {
                closePlayer();
            }
        });
  