import { 
  createDirectus, 
  staticToken, 
  rest,
  readItems,
  registerUser,
  registerUserVerify,
  authentication,
  login,
} from '@directus/sdk'

const directus = createDirectus(process.env.DIRECTUS_URL).with(rest()).with(staticToken(process.env.DIRECTUS_TOKEN));
const client = createDirectus(process.env.DIRECTUS_URL).with(authentication('json')).with(rest());


const getActivities = async (limit=-1, offset=0) => {

  try {
    const events =  await directus.request(
      readItems('events', {
        fields: '*,location,location.*,categories.categories_id.*,tags.tags_id.*,image.*',
        filter: {
          status: {
            _eq: 'published',
          },
          classification: {
            _eq: 'activity'
          },
          _and: [
            { 
              _or: [
                {
                  starts_at: {
                    _null: true
                  },
                },
                {
                  starts_at: {
                    _lte: new Date().toISOString()
                  }
                }
              ]
            },
            { 
              _or: [
                {
                  ends_at: {
                    _null: true
                  },
                },
                {
                  ends_at: {
                    _gte: new Date().toISOString()
                  }
                }
              ]
            },
          ]
        },
        sort: ['starts_at', 'ends_at'],
        limit: limit,
      })
    );

    const result = events.map(event => {
      return {
        ...event,
        categories: event.categories.map(cat => ({ ...cat.categories_id })),
        tags: event.tags.map(tag => ({ ...tag.tags_id })),
      }
    })

    return result;
  } catch (error) {
    console.log(JSON.stringify(error))
    return null
  }
}

const getEvents = async (limit=-1, offset=0) => {
  try {
    const events =  await directus.request(
      readItems('events', {
        fields: 'id,slug,featured,title,starts_at,ends_at,external_link,link_text,price,data_source,classification,location_source_text,location,location.name,location.map_point,categories.categories_id.name,categories.categories_id.id,tags.tags_id.id,tags.tags_id.name,image.*',
        filter: {
          status: {
            _eq: 'published',
          },
          classification: {
            _eq: 'event'
          }, 
          _or: [
            {
              _and: [
                {
                  starts_at: {
                    _lte: new Date().toISOString() 
                  },
                },
                {
                  ends_at: {
                    _gte: new Date().toISOString() 
                  },
                }
              ]
            },
            {
              _and: [
                {
                  starts_at: {
                    _gte: new Date().toISOString() 
                  },
                },
                {
                  ends_at: {
                    _null: true
                  },
                }
              ]
            },
            {
              _and: [
                {
                  starts_at: {
                    _gte: new Date().toISOString() 
                  },
                },
                {
                  ends_at: {
                    _gte: new Date().toISOString()
                  },
                }
              ]
            },
          ]
        },
        sort: ['starts_at'],
        limit: limit,
        offset: offset
      })
    );

    const result = events.map(event => {
      return {
        ...event,
        categories: event.categories.map(cat => ({ ...cat.categories_id })),
        tags: event.tags.map(tag => ({ ...tag.tags_id })),
      }
    })

    return result;
  } catch (error) {
    console.log(JSON.stringify(error))
    return []
  }
}

const getEventCategories = async (events) => {
  const eventIds = events.map(e => e.id)

  try {
    const result =  await directus.request(
      readItems('categories', {
        fields: 'id,name,description,slug',
        filter: {
          status: {
            _eq: 'published',
          },
          events: {
            events_id: {
              _in: eventIds
            }
          }
        }
      })
    );

    return result    
  } catch (error) {
    console.log(JSON.stringify(error))
    return []
  }
}

const getCategories = async (category_group) => {
  try {
    const result =  await directus.request(
      readItems('categories', {
        fields: 'id,name,description,slug',
        filter: {
          status: {
            _eq: 'published',
          },
          category_group: {
            group: {
              _eq: category_group
            }
          }
        }
      })
    );

    return result    
  } catch (error) {
    console.log(JSON.stringify(error))
    return []
  }
}

const getEventTags = async (events) => {
  const eventIds = events.map(e => e.id)

  try {
    const result =  await directus.request(
      readItems('tags', {
        fields: 'id,name,description,slug',
        filter: {
          status: {
            _eq: 'published',
          },
          events: {
            events_id: {
              _in: eventIds
            }
          }
        }
      })
    );
    return result    
  } catch (error) {
    console.log({error})
    return []
  }
}

const getTags = async (tag_group) => {
  try {
    const result =  await directus.request(
      readItems('tags', {
        fields: 'id,name,description,slug',
        filter: {
          status: {
            _eq: 'published',
          },
          tag_group: {
            group: {
              _eq: tag_group
            }
          }
        }
      })
    );
    return result    
  } catch (error) {
    console.log({error})
    return []
  }
}

const getDataSources = async () => {
  try {
    const result =  await directus.request(
      readItems('data_sources', {
        fields: '*',
        filter: {
          status: {
            _eq: 'published',
          }
        }
      })
    );

    return result    
  } catch (error) {
    console.log({error})
    return []
  }
}


const getEvent = async (id) => {
  let { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      location(*),
      categories(*),
      tags(*)
    `)
    .eq('id', id)
    .limit(1)
    .single()

  if (error) {
    console.log({error})
  }

  return event
}

const getEventBySlug = async (slug) => {
  try {
    const events = await directus.request(
      readItems('events', {
        fields: '*,location,location.*,categories.categories_id.*,tags.tags_id.*,image.*',
        filter: {
          status: {
            _eq: 'published',
          },
          slug: {
            _eq: slug
          }
        }
      })
    );

    const result = events.map(event => {
      return {
        ...event,
        categories: event.categories.map(cat => ({ ...cat.categories_id })),
        tags: event.tags.map(tag => ({ ...tag.tags_id })),
      }
    })

    if (result[0]) {
      return result[0]
    } else {
      throw Error("No results returned for query")
    }   
  } catch (error) {
    console.log({error})
    return []
  }
}

const getCollectionBySlug = async (slug) => {
  try {
    const results = await directus.request(
      readItems('collections', {
        fields: '*, events.events_id.*, events.events_id.image.*, points_of_interest.points_of_interest_id.*, points_of_interest.points_of_interest_id.image.*',
        filter: {
          status: {
            _eq: 'published',
          },
          slug: {
            _eq: slug
          }
        }
      })
    );

    const items = results.map(result => {
      return {
        ...result,
        events: result.events.map(event => ({ ...event.events_id })),
        points_of_interest: result.points_of_interest.map(poi => ({ ...poi.points_of_interest_id })),
      }
    })

    if (items[0]) {
      return items[0]
    } else {
      throw Error("No results returned for query")
    }   
  } catch (error) {
    console.log({error})
    return []
  }
}

const getFeaturesByCollection = async (collectionId) => {
  try {
    const features =  await directus.request(
      readItems('points_of_interest', {
        fields: '*,location.*,categories.categories_id.*,tags.tags_id.*,images.directus_files_id.*',
        filter: {
          status: {
            _eq: 'published',
          },
          collections: {
            collections_id: {
              id: {
                _eq: collectionId
              }
            }
          }
        },
        limit: -1,
      })
    );

    const result = features.map(feature => {
      return {
        ...feature,
        categories: feature.categories.map(cat => ({ ...cat.categories_id })),
        tags: feature.tags.map(tag => ({ ...tag.tags_id })),
        images: feature.images.map(img => ({ ...img.directus_files_id }))
      }
    })

    return result;
  } catch (error) {
    console.log(JSON.stringify(error))
    return []
  }
}

const getFeaturesTags = async (features) => {
  const featuresIds = features.map(p => p.id)

  try {
    const result =  await directus.request(
      readItems('tags', {
        fields: 'id,name,description,slug',
        filter: {
          status: {
            _eq: 'published',
          },
          points_of_interest: {
            points_of_interest_id: {
              _in: featuresIds
            }
          }
        }
      })
    );
    return result    
  } catch (error) {
    console.log({error})
    return []
  }
}

const getFeaturesCategories = async (features) => {
  const featuresIds = features.map(p => p.id)

  try {
    const result =  await directus.request(
      readItems('categories', {
        fields: 'id,name,description,slug',
        filter: {
          status: {
            _eq: 'published',
          },
          points_of_interest: {
            points_of_interest_id: {
              _in: featuresIds
            }
          }
        }
      })
    );
    return result    
  } catch (error) {
    console.log({error})
    return []
  }
}

const getCategoriesByGroup = async (group) => {

  try {
    const result =  await directus.request(
      readItems('categories', {
        fields: 'id,name,description,slug,group,colour',
        filter: {
          status: {
            _eq: 'published',
          },
          category_group: {
            _eq: group
          }
        },
        sort: ['sort'],
      })
    );
    return result    
  } catch (error) {
    console.log({error})
    return []
  }
}

const getPageData = async (slug) => {
  try {
    const result =  await directus.request(
      readItems('pages', {
        fields: '*,collection.id,collection.preview,collection.category_group.*,collection.tag_group.*,share_image.*',
        filter: {
          status: {
            _eq: 'published',
          },
          slug: {
            _eq: slug,
          },
        },
        limit: 1,
      })
    );

    if (result[0]) {
      return result[0]    
    } else {
      throw Error(`No results found for ${slug}`)
    }
  } catch (error) {
    console.log({error})
    return null
  }
}

const getPagesByTemplate = async (template) => {
  try {
    const result =  await directus.request(
      readItems('pages', {
        fields: 'slug,title,description,date_created,main_image.*',
        filter: {
          status: {
            _eq: 'published',
          },
          template: {
            _eq: template
          },
        },
        sort: ['-date_created'],
        limit: -1,
      })
    );

    return result
  } catch (error) {
    console.log({error})
    return []
  }
}

const getPages = async () => {
  try {
    const result =  await directus.request(
      readItems('pages', {
        fields: 'slug,title,description,date_created,main_image.*,template',
        filter: {
          status: {
            _eq: 'published',
          },
        },
        sort: ['-date_created'],
        limit: -1,
      })
    );

    return result
  } catch (error) {
    console.log({error})
    return []
  }
}

const getCamps = async () => {
  try {
    const events =  await directus.request(
      readItems('events', {
        fields: '*,location,location.*,categories.categories_id.name,categories.categories_id.id,tags.tags_id.id,tags.tags_id.name,image.*',
        filter: {
          status: {
            _eq: 'published',
          },
          classification: {
            _eq: 'camp'
          }, 
        },
        sort: ['title'],
        limit: -1,
        offset: 0
      })
    );

    const result = events.map(event => {
      return {
        ...event,
        categories: event.categories.map(cat => ({ ...cat.categories_id })),
        tags: event.tags.map(tag => ({ ...tag.tags_id })),
      }
    })

    return result;
  } catch (error) {
    console.log(JSON.stringify(error))
    return []
  }
}

const register = async (firstName, lastName, email, password) => {
  try {
    const result = await directus.request(registerUser(email, password, {
      first_name: firstName,
      last_name: lastName,
      verification_url: process.env.DIRECTUS_VERIFICATION_URL
    }))

    return result
  } catch (error) {
    return error
  }
}

const loginUser = async (email, password) => {
  try {
    const response = await client.login(email, password);
    return response;
  } catch (err) {
    throw new Error(err.message);
  }
};

const verifyEmail = async (token) => {
  try {
    await directus.request(registerUserVerify(token))
  } catch (error) {
    return error
  }
}
const getProfiles = async ({skillID = -1, profileID = -1}) => {
  
  try {
    //Changed this filter to reference the SKILL ID insteadf of the ID in the junction table
    const filters = {
      status: { _eq: 'public' },
      ...(skillID != -1 && {
        skills: {
          skills_id: {
            id: { _eq: skillID }
          }
        }
      }),
      ...(profileID != -1 && {
        id: { _eq: profileID }
      })
    };

    const result = await directus.request(
      readItems("profiles", {
        fields: [
          "id",
          "city",
          "is_visible",
          "is_verified",
          "name",
          "headline",
          "bio",
          "interests",
          "experiences",
          "profile_picture",
          "preferred_contact_method",
          "status",
          "user_created",
          "skills.*.*"
        ],
        filter: filters,
        sort: ["id"],
        limit: -1,
      })
    );

    //console.log(result);
    return result.data || result;

  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
};

const getProfileSkills = async () => {
  try {
    const result =  await directus.request(
      readItems('skills', {
        fields: 'id,name',
        sort: ['id'],
        limit: -1,
      })
    );

    return result
  } catch (error) {
    console.log({error})
    return []
  }
}

// // this can probably be merged into getProfile with an optional parameter
// const getProfileById = async (profileID) => {
//   try {

//     const result = await directus.request(
//       readItems("profiles", {
//         fields: [
//           "id",
//           "city",
//           "is_visible",
//           "is_verified",
//           "name",
//           "headline",
//           "bio",
//           "interests",
//           "experiences",
//           "profile_picture",
//           "preferred_contact_method",
//           "status",
//           "user_created",
//           "skills"
//         ],
//         filter: {id: {_eq: profileID}},
//         sort: ["id"],
//         limit: -1,
//       })
//     );

//     //console.log(result);
//     return result.data || result;
//   } catch (error) {
//     console.error("Error fetching profiles:", error);
//     return [];
//   }
// };

export { 
  getEvents,
  getEvent,
  getEventCategories,
  getCategories,
  getTags,
  getEventTags,
  getEventBySlug,
  getCollectionBySlug, 
  getDataSources,
  getActivities,
  getFeaturesByCollection,
  getFeaturesTags,
  getFeaturesCategories,
  getCategoriesByGroup,
  getPageData,
  getPagesByTemplate,
  getPages,
  getCamps,
  register,
  loginUser,
  verifyEmail,
  getProfiles,
  getProfileSkills,
  //getProfileById
};
