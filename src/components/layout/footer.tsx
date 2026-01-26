export default function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto text-center text-text-secondary text-sm glass-card py-4">
        &copy; {new Date().getFullYear()} MAKE MY TEE. All Rights Reserved.
      </div>
    </footer>
  );
}
