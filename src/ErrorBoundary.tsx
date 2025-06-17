class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Component Error:', error, info);
  }

  render() {
    return this.state.hasError 
      ? <div>Error displaying status effects</div>
      : this.props.children;
  }
}

<ErrorBoundary>
  <StatusEffects />
</ErrorBoundary>