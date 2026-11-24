(function(){
  "use strict";
  function toast(msg){
    var t = document.getElementById("toast");
    if (!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role","status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function(){ t.hidden = true; }, 2200);
  }

  /* فلترة المقالات في الصفحة الرئيسية */
  var finder = document.querySelector("[data-finder]");
  if (finder){
    var input = finder.querySelector("input");
    var buttons = finder.querySelectorAll("[data-topic]");
    var cards = document.querySelectorAll("[data-card]");
    var empty = document.querySelector("[data-empty]");
    var count = document.querySelector("[data-count]");
    var topic = "all";
    var norm = function(s){ return (s || "").toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[ً-ْـ]/g,""); };
    function apply(){
      var q = norm(input.value.trim()), shown = 0;
      cards.forEach(function(c){
        var okT = topic === "all" || (" " + c.dataset.topics + " ").indexOf(" " + topic + " ") >= 0;
        var okQ = !q || norm(c.dataset.text).indexOf(q) >= 0;
        c.hidden = !(okT && okQ); if (!c.hidden) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = shown;
    }
    buttons.forEach(function(b){
      b.addEventListener("click", function(){
        topic = b.dataset.topic;
        buttons.forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
      });
    });
    input.addEventListener("input", apply);
    function fromHash(scroll){
      var h = decodeURIComponent((location.hash || "").slice(1));
      var tb = h && finder.querySelector('[data-topic="' + h + '"]');
      if (!tb) return;
      tb.click();
      if (scroll){ var sec = document.getElementById("articles"); if (sec) sec.scrollIntoView({behavior:"smooth"}); }
    }
    fromHash(true);
    window.addEventListener("hashchange", function(){ fromHash(true); });
  }

  /* الرف: الكتاب يتسحب ويتفتح وبعدين يفتح المقال */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function cleanupBooks(){
    document.querySelectorAll(".book-fly,.book-backdrop").forEach(function(x){ x.remove(); });
    document.querySelectorAll(".spine.pulled").forEach(function(s){ s.classList.remove("pulled"); s.style.visibility = ""; });
  }
  function openBook(a){
    if (document.querySelector(".book-fly")) return;
    var href = a.getAttribute("href");
    var cs = getComputedStyle(a);
    a.classList.add("pulled");
    setTimeout(function(){
      var r = a.getBoundingClientRect();
      var back = document.createElement("div"); back.className = "book-backdrop";
      var fly = document.createElement("div"); fly.className = "book-fly";
      fly.style.setProperty("--bk", cs.getPropertyValue("--bk"));
      fly.style.setProperty("--ink-b", cs.getPropertyValue("--ink-b"));
      fly.style.left = r.left + "px"; fly.style.top = r.top + "px";
      fly.style.width = r.width + "px"; fly.style.height = r.height + "px";
      var page = document.createElement("div"); page.className = "bf-page";
      var ps = document.createElement("small"); ps.textContent = a.dataset.src || "";
      var pb = document.createElement("b"); pb.textContent = a.dataset.title || "";
      var pn = document.createElement("span"); pn.textContent = "بيتفتح…";
      page.append(ps, pb, pn);
      var cover = document.createElement("div"); cover.className = "bf-cover";
      var front = document.createElement("div"); front.className = "bf-front";
      var fb = document.createElement("b"); fb.textContent = a.dataset.title || "";
      var fs = document.createElement("small"); fs.textContent = a.dataset.src || "";
      front.append(fb, fs);
      var backFace = document.createElement("div"); backFace.className = "bf-back";
      cover.append(front, backFace);
      fly.append(page, cover);
      document.body.append(back, fly);
      a.style.visibility = "hidden";
      var w = Math.min(320, window.innerWidth * 0.72), h = Math.min(w * 1.42, window.innerHeight * 0.78);
      w = h / 1.42;
      fly.getBoundingClientRect();
      requestAnimationFrame(function(){
        back.classList.add("on");
        fly.classList.add("center");
        fly.style.left = (window.innerWidth - w) / 2 + "px";
        fly.style.top = (window.innerHeight - h) / 2 + "px";
        fly.style.width = w + "px"; fly.style.height = h + "px";
      });
      setTimeout(function(){ fly.classList.add("open"); }, 600);
      setTimeout(function(){ location.href = href; }, 1300);
    }, 230);
  }
  document.querySelectorAll(".spine").forEach(function(a){
    a.addEventListener("click", function(ev){
      if (reduce || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
      ev.preventDefault();
      openBook(a);
    });
  });
  window.addEventListener("pageshow", cleanupBooks);

  /* نسخ لينك الصفحة */
  document.querySelectorAll("[data-copy]").forEach(function(b){
    b.addEventListener("click", function(){
      var url = location.href.split("#")[0];
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(function(){ toast("اللينك اتنسخ"); }, function(){ toast(url); });
      } else { toast(url); }
    });
  });

  /* إجابة التمرين بتتحفظ على الجهاز ده */
  var ta = document.querySelector("[data-exercise]");
  if (ta){
    var key = "lib.ex." + ta.dataset.exercise, st = document.querySelector("[data-saved]"), tm;
    try { ta.value = localStorage.getItem(key) || ""; } catch(e){}
    ta.addEventListener("input", function(){
      clearTimeout(tm);
      tm = setTimeout(function(){
        try { localStorage.setItem(key, ta.value); if (st) st.textContent = "اتحفظت على الجهاز ده"; }
        catch(e){ if (st) st.textContent = "مش هتتحفظ في المتصفح ده"; }
      }, 500);
    });
  }
})();
