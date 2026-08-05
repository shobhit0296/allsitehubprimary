export default function PageFooter() {
  return (
    <footer className="border-t border-white/5 py-6 text-center">
      <p className="text-[var(--text-muted)] text-xs">
        © {new Date().getFullYear()}{' '}
        <span className="text-blue-400 font-semibold">Allsitehub</span>
        {' '}· Curated streaming directory · We do not host any content.
      </p>
    </footer>
  );
}
