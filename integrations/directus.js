import { 
  createDirectus, 
  staticToken, 
  rest,
  readItems,
  readSingleton
} from '@directus/sdk'

const directus = createDirectus(process.env.DIRECTUS_URL).with(rest()).with(staticToken(process.env.DIRECTUS_TOKEN));

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
                  start_date: {
                    _null: true
                  },
                },
                {
                  start_date: {
                    _lte: new Date().toISOString()
                  }
                }
              ]
            },
            { 
              _or: [
                {
                  end_date: {
                    _null: true
                  },
                },
                {
                  end_date: {
                    _gte: new Date().toISOString()
                  }
                }
              ]
            },
          ]
        },
        sort: ['start_date', 'start_time'],
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
    return []
  }
}

const getEvents = async (limit=-1, offset=0) => {
  try {
    const events =  await directus.request(
      readItems('events', {
        fields: '*,location,location.name,categories.categories_id.name,categories.categories_id.id,tags.tags_id.id,tags.tags_id.name,image.*',
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
                  start_date: {
                    _lte: new Date().toISOString() 
                  },
                },
                {
                  end_date: {
                    _gte: new Date().toISOString() 
                  },
                }
              ]
            },
            {
              _and: [
                {
                  start_date: {
                    _gte: new Date().toISOString() 
                  },
                },
                {
                  end_date: {
                    _null: true
                  },
                }
              ]
            },
            {
              _and: [
                {
                  start_date: {
                    _gte: new Date().toISOString() 
                  },
                },
                {
                  end_date: {
                    _gte: new Date().toISOString()
                  },
                }
              ]
            },
          ]
        },
        sort: ['start_date', 'start_time'],
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


export { 
  getEvents,
  getEvent,
  getEventCategories,
  getCategories,
  getTags,
  getEventTags,
  getEventBySlug, 
  getDataSources,
  getActivities,
  getFeaturesByCollection,
  getFeaturesTags,
  getFeaturesCategories,
  getCategoriesByGroup,
  getPageData,
  getPagesByTemplate,
};
