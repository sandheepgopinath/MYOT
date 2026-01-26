export default function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="container mx-auto text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} MAKE MY TEE. All Rights Reserved.
      </div>
    </footer>
  );
}
