export default function Footer() {
  return (
    <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t mt-16">
      <div className="container mx-auto text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} MYOT: Make Your Own Tee. All Rights
        Reserved.
      </div>
    </footer>
  );
}
