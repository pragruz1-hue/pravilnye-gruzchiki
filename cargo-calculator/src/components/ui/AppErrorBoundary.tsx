import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message || 'Неизвестная ошибка 3D-сцены' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('3D calculator crashed:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-[#10131b] p-6 text-white">
        <div className="max-w-xl rounded-[28px] border border-orange-400/30 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 inline-flex rounded-full bg-orange-500/20 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-200">Правильные грузчики · 3D калькулятор</div>
          <h1 className="mb-3 text-3xl font-black">Сцена не запустилась</h1>
          <p className="mb-4 text-slate-200">Вместо белого экрана теперь показываем ошибку. Обычно помогает обновить страницу без кэша или перезапустить dev server.</p>
          <pre className="max-h-40 overflow-auto rounded-2xl bg-black/40 p-3 text-xs text-orange-100">{this.state.message}</pre>
          <button className="mt-5 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#d35400] px-5 py-3 font-black text-white" onClick={() => window.location.reload()}>Обновить страницу</button>
        </div>
      </div>
    );
  }
}
