import Link from 'next/link';

export default function HomePage(){
    return (
      <div style={{ padding: '20px' }}>
        <h1>Home Page</h1>
        <p>This is the home content</p>
        <Link href="/">Back to Home</Link>
      </div>
    );
}
