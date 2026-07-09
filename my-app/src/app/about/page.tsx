import Link from 'next/link';

export default function AboutPage(){
    return (
      <div style={{ padding: '20px' }}>
        <h1>About Page</h1>
        <p>This is the about content</p>
        <Link href="/">Back to Home</Link>
      </div>
    );
}
