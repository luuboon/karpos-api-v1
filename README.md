<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Karpos API - Guía de Funcionalidades Avanzadas

Esta guía te mostrará cómo utilizar las funcionalidades avanzadas de SQLite/libSQL implementadas en la API de Karpos.

## Índice

1. [Aplicar migraciones](#aplicar-migraciones)
2. [Triggers](#triggers)
3. [Vistas](#vistas)
4. [Procedimientos almacenados](#procedimientos-almacenados)
5. [Uso en aplicaciones móviles y web](#uso-en-aplicaciones-móviles-y-web)

## Aplicar migraciones

Para aplicar las migraciones que incluyen los triggers, vistas y procedimientos almacenados, ejecuta:

```bash
# Inicia el servidor
npm run start:dev

# En otra terminal, ejecuta:
curl -X POST http://localhost:3000/migrations/apply
```

## Triggers

### Trigger para usuarios eliminados

Hemos implementado un trigger que guarda automáticamente los datos de los usuarios eliminados en una tabla especial `deleted_users`. Este trigger se ejecuta automáticamente cuando se elimina un usuario de la tabla `users`.

```sql
CREATE TRIGGER IF NOT EXISTS save_deleted_users
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO deleted_users (email, nombre)
    SELECT OLD.email, 
           COALESCE(
               (SELECT nombre FROM patients WHERE id_us = OLD.id),
               (SELECT nombre FROM doctors WHERE id_us = OLD.id),
               'Usuario Desconocido'
           );
END;
```

Para probar este trigger, puedes eliminar un usuario existente:

```bash
# Obtén un token de administrador
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@karpos.com",
    "password": "Admin123!"
  }'

# Elimina un usuario (reemplaza el ID y el token)
curl -X DELETE http://localhost:3000/users/4 \
  -H "Authorization: Bearer TU_TOKEN_DE_ACCESO"
```

## Vistas

### Vista de datos de pacientes (paciendatos)

Hemos creado una vista que combina los datos de los pacientes con sus historiales médicos.

Para acceder a esta vista:

```bash
# Obtener todos los datos de pacientes
curl -X GET http://localhost:3000/patients/view/pacien-datos \
  -H "Authorization: Bearer TU_TOKEN_DE_ACCESO"

# Obtener datos de un paciente específico
curl -X GET http://localhost:3000/patients/view/pacien-datos/1 \
  -H "Authorization: Bearer TU_TOKEN_DE_ACCESO"
```

### Vista de detalles de citas (appointment_details)

Esta vista proporciona detalles completos de las citas, incluyendo información de pacientes y doctores.

Para acceder a esta vista:

```bash
curl -X GET http://localhost:3000/appointments/details/view \
  -H "Authorization: Bearer TU_TOKEN_DE_ACCESO"
```

## Procedimientos almacenados

### Procedimiento para agendar citas

Hemos simulado un procedimiento almacenado para agendar citas con validaciones integradas:

- Verifica que el paciente exista
- Verifica que el doctor exista
- Verifica que el doctor no tenga otra cita en la misma fecha y hora

Para usar este procedimiento:

```bash
curl -X POST http://localhost:3000/appointments/schedule-procedure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_DE_ACCESO" \
  -d '{
    "id_pc": 1,
    "id_dc": 1,
    "date": "2025-04-20",
    "time": "10:00",
    "payment_amount": 500.00
  }'
```

## Uso en aplicaciones móviles y web

### En React Native (móvil)

```javascript
// Ejemplo para agendar una cita usando el procedimiento almacenado
const scheduleAppointment = async (appointment) => {
  try {
    const response = await fetch('http://tu-ip:3000/appointments/schedule-procedure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(appointment)
    });
    
    const result = await response.json();
    
    // Verificar el resultado
    if (result.message.includes('Error')) {
      // Manejar error
      console.error(result.message);
    } else {
      // Éxito
      console.log(result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error al agendar cita:', error);
    throw error;
  }
};

// Ejemplo para obtener datos de la vista de pacientes
const getPatientData = async (patientId) => {
  try {
    const response = await fetch(`http://tu-ip:3000/patients/view/pacien-datos/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener datos del paciente:', error);
    throw error;
  }
};
```

### En React (web)

```javascript
// Ejemplo para obtener datos de la vista de detalles de citas
const getAppointmentDetails = async () => {
  try {
    const response = await fetch('http://localhost:3000/appointments/details/view', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener detalles de citas:', error);
    throw error;
  }
};
```

## Notas importantes

1. **Turso/libSQL**: Las funcionalidades se implementaron usando las capacidades de libSQL, la base de datos subyacente de Turso.

2. **Transacciones**: Aunque SQLite/libSQL soporta transacciones, la implementación en Turso tiene algunas limitaciones. Por eso, simulamos el comportamiento de los procedimientos almacenados en el código del servidor.

3. **Aplicando cambios manuales**: Si necesitas agregar más triggers o vistas, puedes modificar el archivo `src/database/migrations/turso-migrate.sql` y luego ejecutar el endpoint de migraciones nuevamente.

## Solución de problemas

Si encuentras algún error al aplicar las migraciones, verifica:

1. Que tu base de datos Turso esté correctamente configurada y accesible
2. Que las tablas referenciadas en los triggers y vistas existan
3. Que los índices no estén ya creados (el mensaje "already exists" es normal y se maneja automáticamente)

Para más ayuda, consulta los logs del servidor o contacta al equipo de desarrollo.
