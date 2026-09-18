import { test } from '@japa/runner'

test.group('Comments', () => {
    test('guestbook page loads successfully', async ({ client }) => {
        const response = await client.get('/guestbook')
        response.assertStatus(200)
    })

    // Note: Testing actual comment submission requires database setup and potentially mocking the GeolocationService 
    // or dealing with external API calls. For now, we ensure the page is accessible.
    test('api stats endpoint returns json', async ({ client }) => {
        const response = await client.get('/guestbook/stats/geo')
        response.assertStatus(200)
        response.assertBodyContains({ countries: [], cities: [] }) // Assuming empty DB for test env if not seeded
    })
})
