// components/MercadoPagoScripts.tsx

import Script from "next/script";

export default function MercadoPagoScripts() {
    return (
        <>
            <Script
                src="https://sdk.mercadopago.com/js/v2"
                strategy="afterInteractive"
            />

            <Script
                src="https://www.mercadopago.com/v2/security.js"
                strategy="afterInteractive"
            />
        </>
    );
}