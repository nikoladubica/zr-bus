import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://zrbus.ddns.net';

const PageHead = ({ title, description, canonical, ogImage, noindex = false, jsonLd }) => {
    const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
    const image = ogImage ?? `${SITE_URL}/android-chrome-512x512.png`;

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={image} />

            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default PageHead;
