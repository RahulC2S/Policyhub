export function showToast(message, type = 'info', duration = 4500) {
  try {
    let container = document.getElementById('global-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global-toast-container';
      container.style.position = 'fixed';
      container.style.right = '20px';
      container.style.top = '20px';
      container.style.bottom = 'auto';
      container.style.zIndex = 99999;
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `app-toast app-toast--${type}`;
    toast.style.minWidth = '260px';
    toast.style.maxWidth = '420px';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 8px 30px rgba(2,6,23,0.12)';
    toast.style.color = '#0f172a';
    toast.style.fontSize = '0.95rem';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 220ms ease, transform 220ms ease';
    toast.style.transform = 'translateY(-6px)';

    if (type === 'success') {
      toast.style.background = '#ecfdf5';
      toast.style.border = '1px solid #bbf7d0';
    } else if (type === 'error') {
      toast.style.background = '#fee2e2';
      toast.style.border = '1px solid #fca5a5';
    } else if (type === 'warning') {
      toast.style.background = '#fff7ed';
      toast.style.border = '1px solid #ffd8a8';
    } else {
      toast.style.background = '#f8fafc';
      toast.style.border = '1px solid #e5e7eb';
    }

    toast.innerText = message;
    // insert newest toasts at the top
    container.insertBefore(toast, container.firstChild);

    // animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    const remove = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        try { container.removeChild(toast); } catch (e) {}
        if (container.children.length === 0) {
          try { document.body.removeChild(container); } catch (e) {}
        }
      }, 220);
    };

    const timer = setTimeout(remove, duration);
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      remove();
    });
  } catch (err) {
    // last-resort fallback
    try { window.alert(message); } catch (e) { console.log(message); }
  }
}
