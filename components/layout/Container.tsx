const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {children}
    </div>
  );
};

export default Container;
