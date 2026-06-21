(function(){
  var nav = document.querySelector('nav.topnav');
  if(!nav) return;
  var btn = nav.querySelector('.mob-toggle');
  if(!btn) return;

  function close(){ nav.classList.remove('nav-open'); document.body.classList.remove('nav-lock'); }
  function open(){ nav.classList.add('nav-open'); document.body.classList.add('nav-lock'); }
  function toggle(){ nav.classList.contains('nav-open') ? close() : open(); }

  btn.addEventListener('click', function(e){ e.stopPropagation(); toggle(); });

  // Close when tapping a link in the drawer
  nav.querySelectorAll('.navlinks a').forEach(function(a){
    a.addEventListener('click', function(){ close(); });
  });

  // Close on outside click
  document.addEventListener('click', function(e){
    if(!nav.contains(e.target)) close();
  });

  // Close on Escape
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') close();
  });

  // Close when resizing back to desktop
  window.addEventListener('resize', function(){
    if(window.innerWidth > 980) close();
  });
})();
