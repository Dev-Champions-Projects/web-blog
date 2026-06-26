interface HeadingProps {
    title: string;
    center?: boolean;
    lg?: boolean;
    md?: boolean;
}

const Heading = ({ title, center, lg, md }: HeadingProps) => {
    return (<div className={center ? 'text-center' : 'text-start'}>
        {lg && <h1 className="font-bold text-4xl my-2">{title}</h1>}
        {md && <h2 className="font-bold text-3xl my-2">{title}</h2>}
        {!lg && !md && <h3 className="font-bold text-2xl my-2">{title}</h3>}
    </div>);
}

export default Heading;