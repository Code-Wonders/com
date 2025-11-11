document.addEventListener('DOMContentLoaded', () => {
    const langToggleBtn = document.getElementById('lang-toggle');
    const htmlTag = document.documentElement;

    // تحديد الحالة الأولية للغة من HTML (الافتراضي هو الإنجليزية)
    let isArabic = htmlTag.getAttribute('dir') === 'rtl';

    // دالة تبديل اللغة الموحدة
    const toggleLanguage = () => {
        isArabic = !isArabic;

        if (isArabic) {
            // تحويل إلى عربي (RTL)
            htmlTag.lang = 'ar';
            htmlTag.dir = 'rtl';
            langToggleBtn.textContent = 'EN';
        } else {
            // تحويل إلى إنجليزي (LTR)
            htmlTag.lang = 'en';
            htmlTag.dir = 'ltr';
            langToggleBtn.textContent = 'AR';
        }

        // تحديث موضع الروبوت عند تغيير الاتجاه
        updateRobotPosition();
    };

    // تفعيل اللغة الافتراضية
    const initializeLanguage = () => {
        // إذا كان الاتجاه في الـ HTML هو LTR (الافتراضي)، نحتاج لإجراء التبديل الأول لضبط الحالة الصحيحة
        if (htmlTag.dir === 'ltr') {
            isArabic = false;
        } else {
            isArabic = true;
        }

        // إعداد نص الزر ليعكس اللغة التي سيتم التبديل إليها لاحقًا
        langToggleBtn.textContent = isArabic ? 'EN' : 'AR';
    };

    initializeLanguage(); // تشغيل الضبط الأولي
    langToggleBtn.addEventListener('click', toggleLanguage);

    // -----------------------------------------------------------------
    // 1. تأثيرات الحركة (Scroll Animation)
    // -----------------------------------------------------------------
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // إيقاف المراقبة بعد الظهور مرة واحدة
            }
        });
    }, {
        threshold: 0.1 // تفعيل الحركة عند ظهور 10% من القسم
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // -----------------------------------------------------------------
    // 2. وظيفة الأكورديون (FAQ)
    // -----------------------------------------------------------------
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // إغلاق الكل أولاً
            document.querySelectorAll('.accordion-header[aria-expanded="true"]').forEach(openHeader => {
                const openContent = openHeader.nextElementSibling;
                openHeader.setAttribute('aria-expanded', 'false');
                openContent.style.maxHeight = null;
                // إزالة البادينج الإضافي عند الإغلاق
                openContent.style.paddingTop = '0';
                openContent.style.paddingBottom = '0';
            });

            // فتح العنصر الحالي إذا لم يكن مفتوحاً
            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                // يتم حساب الـ scrollHeight ثم يتم إضافة قيمة البادينج النهائية
                content.style.maxHeight = content.scrollHeight + 30 + "px"; // 30px للبادينج (15px فوق و 15px تحت)
                content.style.paddingTop = '15px'; // تم تعديله ليتطابق مع CSS
                content.style.paddingBottom = '15px'; // تم تعديله ليتطابق مع CSS
            }
        });
    });

    // -----------------------------------------------------------------
    // 3. وظيفة عداد الإنجازات (Counter)
    // -----------------------------------------------------------------
    const counters = document.querySelectorAll('.counter-number');

    const startCounter = (el) => {
        const target = +el.getAttribute('data-target');
        const duration = 2000; // 2 ثانية
        let start = null;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const value = Math.floor((progress / duration) * target);

            if (progress < duration) {
                el.textContent = value.toLocaleString(); // إضافة فواصل الألوف
                window.requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString();
            }
        };

        window.requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // تفعيل العد لجميع العدادات بمجرد رؤية القسم
                counters.forEach(startCounter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const achievementSection = document.getElementById('achievements');
    if (achievementSection) {
        counterObserver.observe(achievementSection);
    }

    // -----------------------------------------------------------------
    // 4. وظيفة الآلة الحاسبة (Calculator)
    // -----------------------------------------------------------------
    const display = document.getElementById('display');
    const buttons = document.getElementById('buttons').querySelectorAll('button');
    // لتبسيط الآلة الحاسبة، سنستخدم الآن رسالة واحدة مع سبان للعربي والإنجليزي مثل الروبوت
    const calcMessage = document.getElementById('calc-message');

    const showCalcMessage = () => {
        // لا نحتاج لتمييز رسالة عربي أو إنجليزي، لأن الـ CSS سيقوم بإخفاء/إظهار الـ spans داخلها
        calcMessage.classList.add('show');
        setTimeout(() => calcMessage.classList.remove('show'), 2000);
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            const currentIsArabic = htmlTag.dir === 'rtl';

            if (value === 'C') {
                display.value = '';
            } else if (value === '=') {
                try {
                    // استخدام Function() لتقييم التعبير الحسابي بأمان أكبر من eval()
                    let result = Function(`return ${display.value}`)();
                    // تقريب النتيجة لعدد عشري معقول إذا كانت طويلة
                    display.value = (typeof result === 'number' && result.toString().includes('.')) ? result.toFixed(5) : result;
                    showCalcMessage(); // تم تعديل استدعاء الدالة
                } catch (error) {
                    display.value = currentIsArabic ? 'خطأ' : 'Error';
                }
            } else {
                display.value += value;
            }
        });
    });

    // -----------------------------------------------------------------
    // 5. وظيفة لعبة الروبوت (Robot Game) - التعديل المطلوب 🤖
    // -----------------------------------------------------------------
    const robot = document.getElementById('robot');
    const goal = document.getElementById('goal');
    const controls = document.querySelectorAll('.controls button');
    const gameMessage = document.getElementById('game-message'); // ✅ عنصر رسالة التهنئة
    const resetButton = document.getElementById('reset-game');   // ✅ زر إعادة اللعب (إذا كان موجوداً في الـ HTML)

    const stepSize = 40; // حجم خطوة الروبوت بالبكسل

    let robotX = 0; // سيتغير بناءً على الاتجاه
    let robotY = 0;
    let isGameActive = true; // ✅ التحكم في الحركة بعد الفوز

    const updateRobotPosition = () => {
        const gameArea = robot.parentElement;
        const isRTL = htmlTag.dir === 'rtl';
        const robotWidth = 50; // من الـ CSS
        const maxX = gameArea.offsetWidth - robotWidth;
        
        // ✅ إعادة تعيين حالة اللعب وإخفاء الرسالة
        gameMessage.classList.remove('show');
        isGameActive = true;

        // إعادة ضبط الموضع الأولي بناءً على الاتجاه
        robotX = isRTL ? maxX : 0;
        robotY = 0;

        // إسناد الموضع
        robot.style.transform = `translate(${robotX}px, ${robotY}px)`;

        // وضع النجمة في الزاوية المقابلة (أسفل اليمين في LTR، أسفل اليسار في RTL)
        goal.style.left = isRTL ? '0px' : maxX + 'px';
        goal.style.top = (gameArea.offsetHeight - robotWidth) + 'px';

        // وضع الروبوت في الزاوية المقابلة (أعلى اليسار لـ LTR وأعلى اليمين لـ RTL)
        robot.style.left = isRTL ? maxX + 'px' : '0px';
        robot.style.top = '0px';

        // إعادة تعيين موضع الروبوت الفعلي
        moveRobot(0, 0, true);
    };

    const moveRobot = (deltaX, deltaY, reset = false) => {
        const gameArea = robot.parentElement;
        const robotWidth = 50;
        const maxX = gameArea.offsetWidth - robotWidth;
        const maxY = gameArea.offsetHeight - robotWidth;
        const isRTL = htmlTag.dir === 'rtl';

        if(reset) {
            robotX = isRTL ? maxX : 0;
            robotY = 0;
        } else if (isGameActive) { // ✅ التحقق من حالة اللعب
            robotX = Math.min(Math.max(0, robotX + deltaX), maxX);
            robotY = Math.min(Math.max(0, robotY + deltaY), maxY);
        } else {
            return; // لا تسمح بالحركة إذا كانت اللعبة متوقفة
        }

        robot.style.transform = `translate(${robotX}px, ${robotY}px)`;
        checkWin();
    };

    const checkWin = () => {
        const gameArea = robot.parentElement;
        const robotWidth = 50;
        const isRTL = htmlTag.dir === 'rtl';

        // حساب موضع النجمة الهدف (أسفل اليمين في LTR، أسفل اليسار في RTL)
        const targetX = isRTL ? 0 : gameArea.offsetWidth - robotWidth;
        const targetY = gameArea.offsetHeight - robotWidth;

        // التحقق من وصول الروبوت إلى موضع الهدف مع السماح بـ هامش بسيط
        if (Math.abs(robotX - targetX) < 10 && Math.abs(robotY - targetY) < 10) {
            // ✅ التعديل: إظهار الرسالة المدمجة بدلاً من alert
            gameMessage.classList.add('show');
            isGameActive = false; // ✅ إيقاف اللعبة

            // كانت تُعيد اللعبة هنا، سنترك زر إعادة اللعب هو المسؤول
            // moveRobot(0, 0, true); // (تم إزالة هذا السطر)
        }
    };

    controls.forEach(button => {
        button.addEventListener('click', () => {
            if (!isGameActive) return; // ✅ منع الحركة إذا لم تكن اللعبة نشطة

            const direction = button.id;
            let deltaX = 0;
            let deltaY = 0;
            const isRTL = htmlTag.dir === 'rtl';

            switch (direction) {
                case 'up':
                    deltaY = -stepSize;
                    break;
                case 'down':
                    deltaY = stepSize;
                    break;
                case 'left':
                    deltaX = isRTL ? stepSize : -stepSize; // عكس الحركة في RTL
                    break;
                case 'right':
                    deltaX = isRTL ? -stepSize : stepSize; // عكس الحركة في RTL
                    break;
            }
            moveRobot(deltaX, deltaY);
        });
    });

    // ✅ ربط زر إعادة اللعب بالدالة
    if (resetButton) {
        resetButton.addEventListener('click', updateRobotPosition);
    }

    // الضبط الأولي لموضع الروبوت عند تحميل الصفحة
    updateRobotPosition();


    // -----------------------------------------------------------------
    // 6. وظيفة قائمة التنقل للموبايل (Hamburger)
    // -----------------------------------------------------------------
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // إغلاق القائمة عند الضغط على أي رابط
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
});