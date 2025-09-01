import type { AppLoadContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';

// Fix for Netlify CommonJS compatibility
import ReactDOMServer from 'react-dom/server';

const { renderToReadableStream } = ReactDOMServer;
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any,
  _loadContext: AppLoadContext,
) {
  console.log('=== Remix Server Entry Point ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Environment:', process.env.NODE_ENV);
  console.log(
    'Available env vars:',
    Object.keys(process.env)
      .filter((key) => !key.includes('SECRET') && !key.includes('KEY'))
      .join(', '),
  );

  try {
    // await initializeModelList({});

    const readable = await renderToReadableStream(<RemixServer context={remixContext} url={request.url} />, {
      signal: request.signal,
      onError(error: unknown) {
        console.error('Render stream error:', error);
        responseStatusCode = 500;
      },
    });

    const body = new ReadableStream({
      start(controller) {
        const head = renderHeadToString({ request, remixContext, Head });

        controller.enqueue(
          new Uint8Array(
            new TextEncoder().encode(
              `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
            ),
          ),
        );

        const reader = readable.getReader();

        function read() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                controller.enqueue(new Uint8Array(new TextEncoder().encode('</div></body></html>')));
                controller.close();

                return;
              }

              controller.enqueue(value);
              read();
            })
            .catch((error) => {
              controller.error(error);
              readable.cancel();
            });
        }
        read();
      },

      cancel() {
        readable.cancel();
      },
    });

    if (isbot(request.headers.get('user-agent') || '')) {
      await readable.allReady;
    }

    responseHeaders.set('Content-Type', 'text/html');

    responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
    responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

    return new Response(body, {
      headers: responseHeaders,
      status: responseStatusCode,
    });
  } catch (error) {
    console.error('=== Critical Server Error ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Return a basic error response
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        env: process.env.NODE_ENV,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
