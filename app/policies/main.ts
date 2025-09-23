/*
|--------------------------------------------------------------------------
| Bouncer policies
|--------------------------------------------------------------------------
|
| You may define a collection of policies inside this file and pre-register
| them when creating a new bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

export const policies = {
  CommentairePolicy: () => import('#policies/commentaire_policy'),
  ContactRequestPolicy: () => import('#policies/contact_request_policy'),
  FaqPolicy: () => import('#policies/skill_policy'),
  ProjectPolicy: () => import('#policies/project_policy'),
  ServicePolicy: () => import('#policies/service_policy'),
  SkillPolicy: () => import('#policies/skill_policy'),
  BlogPolicy: () => import('#policies/skill_policy'),
  TagsPolicy: () => import('#policies/skill_policy'),
  NewsletterPolicy: () => import('#policies/skill_policy'),
  TechnologyPolicy: () => import('#policies/technologie_policy'),
  UserPolicy: () => import('#policies/user_policy'),
}
