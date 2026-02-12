
self.addEventListener('push', function(event) {
    const data = event.data.json();

    const option = {
        body: data.body,
        icon: '/LAPOR.png',
        badge: '/kailo.png',
        data: { url: data.url || '/'}
    };

    event.waitUntil(
        self.registration.showNotification(data.title, option)
    );
});

self.addEventListener('notificationclick', function(event) {
    //console.log('click data', event.notification.data);
    event.notification.close();

    const targetUrl = event.notification.data.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then( windowClients => {
            for (let client of   windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});