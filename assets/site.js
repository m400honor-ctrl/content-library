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
