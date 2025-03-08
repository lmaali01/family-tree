import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <style>
                    </style>
                    {/* Include necessary CSS files */}
                    <link
                        href="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"
                        rel="stylesheet"
                        type="text/css"
                    />
                    <link
                        href="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"
                        rel="stylesheet"
                        type="text/css"
                    />
                </Head>
                <body
                    style={{
                        backgroundImage: 'url("https://img.freepik.com/premium-photo/al-aqsa-mosque-islamic-shrine-located-temple-mount-jerusalem-israel-realistic-3d-background_524159-3927.jpg?w=1480")',
                        backgroundSize: 'cover',           // Cover the entire page
                        backgroundPosition: 'center',      // Center the image
                        backgroundRepeat: 'no-repeat',     // Don't repeat the image
                        minHeight: '100vh',                // Ensure the body takes up at least 100% of the viewport height
                        margin: 0,                         // Remove default margin
                        fontFamily: 'Eskander, Arial, sans-serif', // Optional: Set font globally
                    }}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
