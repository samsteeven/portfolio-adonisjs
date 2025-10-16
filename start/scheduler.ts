import scheduler from 'adonisjs-scheduler/services/main'

// Planifier la commande
scheduler.command('blog:check-scheduled').everyFiveMinutes()
