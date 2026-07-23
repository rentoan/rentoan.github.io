const themeToggle=document.getElementById('themeToggle');
const savedTheme=localStorage.getItem('math-schema-theme');
if(savedTheme==='dark') document.body.classList.add('dark');
if(themeToggle){
  themeToggle.textContent=document.body.classList.contains('dark')?'☀':'◐';
  themeToggle.addEventListener('click',()=>{
    document.body.classList.toggle('dark');
    const dark=document.body.classList.contains('dark');
    themeToggle.textContent=dark?'☀':'◐';
    localStorage.setItem('math-schema-theme',dark?'dark':'light');
  });
}
