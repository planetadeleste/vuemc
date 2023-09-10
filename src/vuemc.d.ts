declare module '@planetadeleste/vuemc' {
    import { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
    import { Ref }                                                   from 'vue';
    import { Rule }                                                  from '@planetadeleste/vuemc/validation';

    type ModelAttr<T = Record<string, any>> = keyof T | string;

    /** Base model class. */
    export class Model<
        A extends Record<string, any> = Record<string, any>
    > extends Base {
        [K: string]: any;

        private readonly _loading: Ref<boolean>;
        private readonly _saving: Ref<boolean>;
        private readonly _deleting: Ref<boolean>;
        private readonly _fatal: Ref<boolean>;
        private readonly _attributes: Ref<Partial<A>>;
        private readonly _collections: Ref<Record<string, Collection>>;
        private readonly _reference: Ref<Record<string, any>>;
        private readonly _mutations: Ref<Record<string, Mutation>>;
        private readonly _errors: Ref<Record<string, string[]>>;

        /**
         * Creates a new instance, called when using 'new'.
         *
         * @param {Object} [attributes] Model attributes
         * @param {Collection} [collection] Collection that this model belongs to.
         * @param {Object} [options] Options to set on the model.
         */
        constructor(
            attributes?: Partial<A>,
            collection?: Collection | null,
            options?: Record<string, any>
        );

        /**
         * A convenience wrapper around the model's attributes that are saved. This
         * is similar to the `saved` method, but instead of accessing a single
         * property it returns the whole saved object, so that you can do something
         * like model.$.attribute when you want to display it somewhere.
         *
         * @returns {Object} This model's saved, reference data.
         */
        get $(): Partial<A>;

        /** @returns {Object} This model's "active" state attributes. */
        get attributes(): Partial<A>;

        /** @returns {Object} The collection that this model is registered to. */
        get collections(): Collection[];

        /** @returns {Object} This model's errors, which are cleared automatically. */
        get errors(): Record<string, string | string[]>;

        get loading(): boolean;

        set loading(bVal: boolean);

        get saving(): boolean;

        set saving(bVal: boolean);

        get deleting(): boolean;

        set deleting(bVal: boolean);

        get fatal(): boolean;

        set fatal(bVal: boolean);

        /**
         * Creates a copy of this model, with the same attributes and options. The
         * clone will also belong to the same collections as the subject.
         *
         * @returns {Model}
         */
        clone<T extends Model<A>>(): T;

        /**
         * Prepare certain methods to only be called once. These are methods that
         * are expected to return the same data every time.
         *
         * @see {@link https://lodash.com/docs/#once}
         */
        memoize(): void;

        /** Returns the model's identifier value. */
        identifier(): string;

        /**
         * @returns {Object} An empty representation of this model. It's important
         *   that all model attributes have a default value in order to be reactive in Vue.
         */
        defaults(): Partial<A>;

        /** @returns {Object} Attribute mutations keyed by attribute name. */
        mutations(): Record<string, Mutation | Mutation[]>;

        /** Add validation rules here, or use option? */
        validation(): Record<string, Rule>;

        /**
         * Returns the default options for this model.
         *
         * @returns {Object}
         */
        getDefaultOptions(): ModelOptions;

        /** Compiles all mutations into pipelines that can be executed quickly. */
        compileMutators(): void;

        /** @returns {Object} Parameters to use for replacement in route patterns. */
        getRouteParameters(): Record<string, any>;

        /**
         * Registers a collection on this model. When this model is created it will
         * automatically be added to the collection. Similarly, when this model is
         * delete it will be remove from the collection. Registering the same
         * collection more than once has no effect.
         *
         * @param {Collection} collection
         */
        registerCollection(collection: Collection | Collection[]): void;

        /**
         * Removes a collection from this model's collection registry, removing all
         * effects that would occur when creating or deleting this model.
         *
         * Unregistering a collection that isn't registered has no effect.
         *
         * @param {Collection} collection
         */
        unregisterCollection(collection: Collection): void;

        /**
         * Reverts all attributes back to their defaults, and completely removes all
         * attributes that don't have defaults. This will also sync the reference
         * attributes, and is not reversable.
         */
        clearAttributes(): void;

        /**
         * Reverts all attributes back to their defaults, and completely removes all
         * attributes that don't have defaults. This will also sync the reference
         * attributes, and is not reversable.
         */
        clear(): void;

        /** Resets model state, ie. `loading`, etc back to their initial states. */
        clearState(): void;

        /**
         * Assigns all given model data to the model's attributes and reference.
         * This will also fill any gaps using the model's default attributes.
         *
         * @param {Object} attributes
         * @returns {Object} The attributes that were assigned to the model.
         */
        assign(attributes: Partial<A>): void;

        /**
         * Resets all attributes back to their reference values (source of truth). A
         * good use case for this is when form fields are bound directly to the
         * model's attributes. Changing values in the form fields will change the
         * attributes on the model. On cancel, you can revert the model back to its
         * saved, original state using reset().
         *
         * You can also pass one or an array of attributes to reset.
         *
         * @param {string | string[]} attribute
         */
        reset(attribute: ModelAttr<A> | ModelAttr<A>[]): void;

        /** @returns {any} The value of an attribute after applying its mutations. */
        mutated(attribute: ModelAttr<A>, value: any): any;

        /**
         * Mutates either specific attributes or all attributes if none provided.
         *
         * @param {string | string[] | undefined} attribute
         */
        mutate(attribute?: ModelAttr<A> | ModelAttr<A>[]): void;

        /**
         * Sync the current attributes to the reference attributes. This is usually
         * only called on save. We have to clone the values otherwise we end up with
         * references to the same object in both attribute sets.
         *
         * You can also pass one or an array of attributes to sync.
         *
         * @param {string | string[]} attribute
         */
        sync(attribute?: ModelAttr<A> | ModelAttr<A>[]): void;

        /**
         * Registers an attribute on this model so that it can be accessed directly
         * on the model, passing through `get` and `set`.
         */
        registerAttribute(attribute: ModelAttr<A>): void;

        /**
         * Sets the value of an attribute and registers the magic "getter" in a way
         * that is compatible with Vue's reactivity. This method should always be
         * used when setting the value of an attribute.
         *
         * @param {string | Object} attribute
         * @param {any} value
         * @returns {any} The value that was set.
         */
        set<T = any>(
            attribute: ModelAttr<A> | A,
            value?: T
        ): T | undefined;

        /**
         * Reverts all attributes back to their defaults, or `undefined` if a
         * default value is not defined.
         *
         * You can also pass one or an array of attributes to unset.
         *
         * @param {string | string[]} attribute
         */
        unset(attribute: ModelAttr<A> | ModelAttr<A>[]): void;

        /**
         * Similar to `saved`, returns an attribute's value or a fallback value if
         * this model doesn't have the attribute.
         *
         * @param {string} attribute
         * @param {any} fallback
         * @returns {any} The value of the attribute or `fallback` if not found.
         */
        get(attribute: ModelAttr<A>, fallback?: any): any;

        /**
         * Similar to `get`, but accesses the saved attributes instead.
         *
         * This is useful in cases where you want to display an attribute but also
         * change it. For example, a modal with a title based on a model field, but
         * you're also editing that field. The title will be updating reactively if
         * it's bound to the active attribute, so bind to the saved one instead.
         *
         * @param {string} attribute
         * @param {any} fallback
         * @returns {any} The value of the attribute or `fallback` if not found.
         */
        saved(attribute: ModelAttr<A>, fallback?: any): any;

        /**
         * Determines if the model has an attribute.
         *
         * @param {string} attribute
         * @returns {boolean} `true` if an attribute exists, `false` otherwise. Will
         *   return true if the object exists but is undefined.
         */
        has(attribute: ModelAttr<A>): boolean;

        /** @returns {Array} */
        getValidateRules(attribute: ModelAttr<A>): Rule[];

        /**
         * Validates a specific attribute of this model, and sets errors for it.
         *
         * @returns {boolean} `true` if valid, `false` otherwise.
         */
        validateAttribute(
            attribute: ModelAttr<A>
        ): Promise<ValidationResultErrorFinalResult>;

        /**
         * Validates all attributes.
         *
         * @param {Object} [attributes] One or more attributes to validate.
         * @returns {Promise}
         */
        validate(
            attributes?: ModelAttr<A> | ModelAttr<A>[]
        ): Promise<ValidationResultErrorFinalResult>;

        /**
         * @returns {Object} A native representation of this model that will
         *   determine the contents of JSON.stringify(model).
         */
        toJSON(): Partial<A>;

        /** Adds this model to all registered collections. */
        addToAllCollections(): void;

        /** Removes this model from all registered collections. */
        removeFromAllCollections(): void;

        /**
         * Returns an array of attribute names that have changed, or `false` if no
         * changes have been made since the last time this model was synced.
         *
         * @returns {Array | boolean} An array of changed attribute names, or
         *   `false` if no attributes have changed since the last sync.
         */
        changed(): ModelAttr<A>[] | false;

        /** Called when a fetch request was successful. */
        onFetchSuccess(response: Response): void;

        /**
         * Called when a fetch request failed.
         *
         * @param {Error} error
         */
        onFetchFailure(error: any): void;

        /** @returns {string} The key to use when generating the `patch` URL. */
        getPatchRoute(): Method;

        /** @returns {string} The key to use when generating the `create` URL. */
        getCreateRoute(): Method;

        /** @returns {string} The key to use when generating the `update` URL. */
        getUpdateRoute(): Method;

        /** @returns {string} The method to use when making an update request. */
        getUpdateMethod(): Method;

        /** @returns {string} The method to use when making an save request. */
        getSaveMethod(): Method;

        /** @inheritDoc */
        getSaveRoute(): Method;

        /**
         * Returns whether this model should perform a "patch" on update, which will
         * only send changed data in the request, rather than all attributes.
         *
         * @returns {boolean} Whether this model should perform a "patch" on update,
         *   which will only send changed data in the request, rather than all attributes.
         */
        shouldPatch(): boolean;

        /** @returns {Object} The data to send to the server when saving this model. */
        getSaveData(): A;

        /** @returns {any} A potential identifier parsed from response data. */
        parseIdentifier(data: any): any;

        /**
         * @returns {boolean} Whether the given identifier is considered a valid
         *   identifier value for this model.
         */
        isValidIdentifier(identifier: any): boolean;

        /**
         * @returns {boolean} Whether this model allows an existing identifier to be
         *   overwritten on update.
         */
        shouldAllowIdentifierOverwrite(): boolean;

        /**
         * Updates the model data with data returned from the server.
         *
         * @param {Object} data
         */
        update(data: Partial<A>): void;

        /**
         * Sets errors for a specific attribute. Support the ability to clear error
         * by passing an empty value.
         *
         * @param {string} attribute
         * @param {string | array} errors
         */
        setAttributeErrors(
            attribute: ModelAttr<A>,
            errors?: string | string[] | ValidationResultError[]
        ): void;

        /**
         * Sets the errors on this model.
         *
         * @param {Object} errors
         */
        setErrors(errors?: Record<string, string | string[]>): void;

        /** @returns {Object} Validation errors on this model. */
        getErrors(): Record<string, string | string[]>;

        /** Clears all errors on this model. */
        clearErrors(): void;

        /**
         * Called when a save request was successful.
         *
         * @param {Object | null} response
         */
        onSaveSuccess(response: ProxyResponse): void;

        /**
         * Called when a save request resulted in a validation error.
         *
         * @param {Object} error
         */
        onSaveValidationFailure(error: ResponseError): void;

        /**
         * Called when a save request resulted in an unexpected error, eg. an
         * internal server error (500)
         *
         * @param {Error} error
         * @param {Object} response
         */
        onFatalSaveFailure(error: any, response: Response | undefined): void;

        /**
         * Called when a save request resulted in a general error.
         *
         * @param {Error} error
         * @param {Object} response
         */
        onSaveFailure(error: any, response: Response | undefined): void;

        /** Called when a delete request was successful. */
        onDeleteSuccess(response: Response): void;

        /**
         * Called when a delete request resulted in a general error.
         *
         * @param {Error} error
         */
        onDeleteFailure(error: any): void;

        /**
         * Called before a fetch request is made.
         *
         * @returns {boolean | undefined} `false` if the request should not be made.
         */
        onFetch(): Promise<RequestOperation>;

        /**
         * @returns {boolean} Whether this model is not persisted yet, ie. has not
         *   been created yet. The default test is to check if the model's
         *   identifier is missing.
         */
        isNew(): boolean;

        /**
         * @returns {boolean} The opposite of `isNew`, returns `true` if this model
         *   is already persisted somewhere else.
         */
        isExisting(): boolean;

        /**
         * Called before a save request is made.
         *
         * @returns {boolean} `false` if the request should not be made.
         */
        onSave(): Promise<RequestOperation>;

        /**
         * Called before a delete request is made.
         *
         * @returns {boolean} `false` if the request should not be made.
         */
        onDelete(): Promise<RequestOperation>;
    }

    /** Base collection class. */
    export class Collection<A extends Model = Model> extends Base {
        private readonly _models: Ref<A[]>;
        private readonly _loading: Ref<boolean>;
        private readonly _saving: Ref<boolean>;
        private readonly _deleting: Ref<boolean>;
        private readonly _fatal: Ref<boolean>;
        private readonly _attributes: Ref<Record<string, any>>;
        private readonly _page: Ref<number | null | undefined>;
        private readonly _registry: Ref<Record<string, any>>;

        /**
         * Creates a new instance, called when using 'new'.
         *
         * @param {Array} [models] Models to add to this collection.
         * @param {Object} [options] Extra options to set on this collection.
         */
        constructor(
            models?: A[],
            options?: Options,
            attributes?: Record<string, any>
        );

        /** Accessor to support Array.length semantics. */
        get length(): number;

        /** @returns {Object} */
        get attributes(): Record<string, any>;

        get models(): A[];
        set models(arModels: A[]);

        get loading(): boolean;
        set loading(bVal: boolean);

        get saving(): boolean;
        set saving(bVal: boolean);

        get deleting(): boolean;
        set deleting(bVal: boolean);

        get fatal(): boolean;
        set fatal(bVal: boolean);

        /**
         * Creates a copy of this collection. Model references are preserved so
         * changes to the models inside the clone will also affect the subject.
         *
         * @returns {Collection}
         */
        clone<T extends Collection>(): T;

        /** @returns {typeof A} The class/constructor for this collection's model type. */
        model(ACtor: { new(...args: any[]): A }): typeof ACtor;

        /** @returns {Object} Default attributes */
        defaults(): Record<string, any>;

        /** @returns {any} The value of an attribute, or a given fallback if not set. */
        get(attribute: string, fallback?: any): any;

        /**
         * Sets an attribute's value, or an object of attributes.
         *
         * @param {string | Object} attribute
         * @param {any} value
         */
        set(attribute: string | Record<string, any>, value?: any): void;

        /** @returns {Object} */
        getAttributes(): Record<string, any>;

        /** @returns {A[]} */
        getModels(): A[];

        /**
         * Returns the default options for this model.
         *
         * @returns {Object}
         */
        getDefaultOptions(): Options;

        /** @returns {Object} Parameters to use for replacement in route patterns. */
        getRouteParameters(): Record<string, any>;

        /** Removes all errors from the models in this collection. */
        clearErrors(): void;

        /** Resets model state, ie. `loading`, etc back to their initial states. */
        clearState(): void;

        /** Removes all models from this collection. */
        clearModels(): void;

        /** Removes all models from this collection. */
        clear(): void;

        /**
         * Syncs all models in this collection. This method delegates to each model
         * so follows the same signature and effects as `Model.sync`.
         */
        sync(): void;

        /**
         * Resets all models in this collection. This method delegates to each model
         * so follows the same signature and effects as `Model.reset`.
         *
         * @param {string | string[]} attribute
         */
        reset(...attribute: string[]): void;

        /** Returns the number of models in this collection. */
        size(): number;

        /** @returns {boolean} `true` if the collection is empty, `false` otherwise. */
        isEmpty(): boolean;

        /**
         * @returns {Object} A native representation of this collection that will
         *   determine the contents of JSON.stringify(collection).
         */
        toJSON(): A[];

        /** @returns {Promise} */
        validate(): Promise<ValidationResultErrorFinalResult[]>;

        /**
         * Create a new model of this collection's model type.
         *
         * @param {Object} attributes
         * @returns {Model} A new instance of this collection's model.
         */
        createModel(attributes: Record<string, any>): A;

        /**
         * Removes a model from the model registry.
         *
         * @param {Model} model
         */
        removeModelFromRegistry(model: A): void;

        /** @returns {Boolean} True if this collection has the model in its registry. */
        hasModelInRegistry(model: A): boolean;

        /**
         * Adds a model from the model registry.
         *
         * @param {Model} model
         */
        addModelToRegistry(model: A): void;

        /**
         * Called when a model has been added to this collection.
         *
         * @param {Model} model
         */
        onAdd(model: A): void;

        /**
         * Adds a model to this collection.
         *
         * This method returns a single model if only one was given, but will return
         * an array of all added models if an array was given.
         *
         * @param {Model | Array | Object} model Adds a model instance or plain
         *   object, or an array of either, to this collection. A model instance
         *   will be created and returned if passed a plain object.
         * @returns {Model | Array} The added model or array of added models.
         */
        add(model: A[]): A[];
        add(model?: A | Partial<A> | Record<string, any>): A;

        /**
         * Called when a model has been removed from this collection.
         *
         * @param {Model} model
         */
        onRemove(model: A): void;

        /**
         * Removes a model at a given index.
         *
         * @param {number} index
         * @returns {Model} The model that was removed, or `undefined` if invalid.
         * @throws {Error} If a model could not be found at the given index.
         */
        _removeModelAtIndex(index: number): A | undefined;

        /**
         * Removes a `Model` from this collection.
         *
         * @param {Model} model
         * @returns {Model}
         */
        _removeModel(model: A): A | undefined;

        /**
         * Removes the given model from this collection.
         *
         * @param {Model | Object | Array} model Model to remove, which can be a
         *   `Model` instance, an object to filter by, a function to filter by, or
         *   an array of any of the above to remove multiple.
         * @returns {Model | Model[]} The deleted model or an array of models if a
         *   filter or array type was given.
         * @throws {Error} If the model is an invalid type.
         */
        remove(model: A): A;
        remove(model: A[] | Partial<A> | ((model: A) => boolean)): A[];

        /**
         * Determines whether a given value is an instance of a model.
         *
         * @param {any} candidate A model candidate
         * @returns {boolean} `true` if the given `model` is an instance of Model.
         */
        isModel(candidate: any): boolean;

        /**
         * Returns the zero-based index of the given model in this collection.
         *
         * @returns {number} The index of a model in this collection, or -1 if not found.
         * @see {@link https://lodash.com/docs/#findIndex}
         */
        indexOf(model: A): number;

        /**
         * @param {string | function | Object} where
         * @returns {Model} The first model that matches the given criteria, or
         *   `undefined` if none could be found.
         * @see {@link https://lodash.com/docs/#find}
         */
        find(where: Predicate): A | undefined;

        /**
         * Creates a new collection of the same type that contains only the models
         * for which the given predicate returns `true` for, or matches by property.
         *
         * @param {function | Object | string} predicate Receives `model`.
         * @returns {Collection}
         * @see {@link where} Important: Even though this returns a new collection, the references to
         *            each model are preserved, so changes will propagate to both.
         */
        filter(predicate: Predicate): Collection;

        /**
         * Returns the models for which the given predicate returns `true` for, or
         * models that match attributes in an object.
         *
         * @param {function | Object | string} predicate Receives `model`.
         * @returns {Model[]}
         * @see {@link https://lodash.com/docs/#filter}
         */
        where(predicate: Predicate): A[];

        /**
         * Returns an array that contains the returned result after applying a
         * function to each model in this collection.
         *
         * @param {function} callback Receives `model`.
         * @returns {Model[]}
         * @see {@link https://lodash.com/docs/#map}
         */
        map<T = A>(callback: string | ((model: A) => T)): T[];

        /**
         * Iterates through all models, calling a given callback for each one.
         *
         * @param {function} callback Receives `model` and `index`.
         * @see {@link https://lodash.com/docs/#each}
         */
        each(callback: (model: A) => void): void;

        /**
         * Reduces this collection to a value which is the accumulated result of
         * running each model through `iteratee`, where each successive invocation
         * is supplied the return value of the previous.
         *
         * If `initial` is not given, the first model of the collection is used as
         * the initial value.
         *
         * @param {function} iteratee Invoked with three arguments: (result, model, index)
         * @param {any} [initial] The initial value to use for the `result`.
         * @returns {any} The final value of result, after the last iteration.
         */
        reduce<U = A>(
            iteratee: (result: U | undefined, model: A, index: number) => U,
            initial?: U
        ): U | undefined;

        /**
         * @param {function | string} iteratee Attribute name or callback to
         *   determine which values to sum by. Invoked with a single argument `model`.
         * @returns {number} Sum of all models, accessed by attribute or callback.
         */
        sum(iteratee: ((model: A) => number) | string): number;

        /**
         * Returns an object composed of keys generated from the results of running
         * each model through `iteratee`. The corresponding value of each key is the
         * number of times the key was returned by iteratee.
         *
         * @returns {Object}
         * @see {@link https://lodash.com/docs/#countBy}
         */
        count(iteratee: (model: A) => any): Record<string, number>;

        /**
         * Sorts this collection's models using a comparator. This method performs a
         * stable sort (it preserves the original sort order of equal elements).
         *
         * @param {function | string} comparator Attribute name or attribute
         *   function, invoked with a single arg `model`.
         * @see {@link https://lodash.com/docs/#sortBy}
         */
        sort(comparator: ((model: A) => any) | string): void;

        /**
         * @param {Model | Object} model
         * @returns {boolean} `true` if this collection contains the given model,
         *   `false` otherwise.
         */
        has(model: A): boolean;

        /** @returns {Model | undefined} The first model of this collection. */
        first(): A | undefined;

        /** @returns {Model | undefined} The last model of this collection. */
        last(): A | undefined;

        /**
         * Removes and returns the first model of this collection, if there was one.
         *
         * @returns {Model | undefined} Removed model or undefined if there were none.
         */
        shift(): A | undefined;

        /**
         * Removes and returns the last model of this collection, if there was one.
         *
         * @returns {Model | undefined} Removed model or undefined if there were none.
         */
        pop(): A | undefined;

        /**
         * Replaces all models in this collection with those provided. This is
         * effectively equivalent to `clear` and `add`, and will result in an empty
         * collection if no models were provided.
         *
         * @param {Model | Model[]} models Models to replace the current models with.
         */
        replace(models: A | A[]): void;

        /**
         * Returns the query parameters that should be used when paginating.
         *
         * @returns {Object}
         */
        getPaginationQuery(): {
            page: number | null | undefined;
        };

        /** @inheritDoc */
        getFetchQuery(): Record<string, any>;

        /**
         * @param {Object} response
         * @returns {Array | null} Models from the response.
         */
        getModelsFromResponse(response: Response): any;

        /**
         * Called when a save request was successful.
         *
         * @param {Object} response
         */
        onSaveSuccess(response: Response): void;

        /** @returns {Model[]} Models in this collection that are in a "saving" state. */
        getSavingModels(): A[];

        /** @returns {Model[]} Models in this collection that are in a "deleting" state. */
        getDeletingModels(): A[];

        /**
         * Applies an array of validation errors to this collection's models.
         *
         * @param {Array} errors
         * @param {integer} status Response status
         */
        applyValidationErrorArray(errors: any[]): void;

        /**
         * Applies an object of validation errors keyed by model identifiers.
         *
         * @param {Array} errors
         * @param {integer} status Response status
         */
        applyValidationErrorObject(
            errors: Record<string, Record<string, string | string[]>>
        ): void;

        /**
         * Sets validation errors on this collection's models.
         *
         * @param {Array | Object} errors Either an array of length equal to the
         *   number of models in this collection, or an object of errors keyed by
         *   model identifiers.
         */
        setErrors(
            errors: any[] | Record<string, Record<string, string | string[]>>
        ): void;

        /** @returns {Array} An array of this collection's validation errors. */
        getErrors(): Record<string, string | string[]>[];

        /**
         * Called when a save request resulted in a validation error.
         *
         * @param {Object} response
         */
        onSaveValidationFailure(error: any): void;

        /**
         * Called when a save request resulted in an unexpected error, eg. an
         * internal server error (500)
         *
         * @param {Error} error
         * @param {Object} response
         */
        onFatalSaveFailure(error: any, response?: any): void;

        /**
         * Called when a save request failed.
         *
         * @param {Error} error
         * @param {Object} response
         */
        onSaveFailure(error: any): void;

        /** @returns {Array} The data to use for saving. */
        getSaveData(): Record<string, any>;

        /**
         * Sets the page on this collection, enabling pagination. To disable
         * pagination on this collection, pass page as `null` or `undefined`.
         *
         * @param {number | boolean} [page] Page number, or `null` to disable.
         * @returns {Collection} This collection.
         */
        page(page: number | boolean): this;

        /** @returns {integer | null} The page that this collection is on. */
        getPage(): number | null | undefined;

        /** @returns {boolean} Whether this collection is currently paginated. */
        isPaginated(): boolean;

        /**
         * @returns {boolean} Whether this collection is on the last page, ie. there
         *   won't be more results that follow.
         */
        isLastPage(): boolean;

        /**
         * Responsible for adjusting the page and appending of models that were
         * received by a paginated fetch request.
         *
         * @param {Model[]} models
         */
        applyPagination(models: A[]): void;

        /**
         * Called when a fetch request was successful.
         *
         * @param {Object} response
         */
        onFetchSuccess(response: Response): void;

        /**
         * Called when a fetch request failed.
         *
         * @param {Error} error
         */
        onFetchFailure(error: any): void;

        /**
         * Called before a fetch request is made.
         *
         * @returns {boolean | undefined} `false` if the request should not be made.
         */
        onFetch(): Promise<RequestOperation>;

        /**
         * Called when a delete request was successful.
         *
         * @param {Object} response
         */
        onDeleteSuccess(response: Response): void;

        /**
         * Called when a delete request resulted in a general error.
         *
         * @param {Error} error
         * @param {Object} response
         */
        onDeleteFailure(error: any): void;

        /**
         * Called before a save request is made.
         *
         * @returns {boolean} Either `true` or false`if the request should not be
         *   made, where`true` indicates that the request should be considered a
         *   "success" rather than a "cancel".
         */
        onSave(): Promise<RequestOperation>;

        /**
         * Collect all model identifiers.
         *
         * @returns {Array}
         */
        getIdentifiers(models: A[]): string[];

        /** @inheritDoc */
        getDeleteBody(): string[] | {};

        /** @returns {string} The query parameter key to use for model identifiers. */
        getDeleteQueryIdenitifierKey(): string;

        /** @inheritDoc */
        getDeleteQuery(): Record<string, string>;

        /**
         * Called before a delete request is made.
         *
         * @returns {boolean} `false` if the request should not be made.
         */
        onDelete(): Promise<RequestOperation>;

        /**
         * Convert collection to Array. All models inside are converted to JSON
         *
         * @returns {object[]} Converted collection
         */
        toArray(): Record<string, any>[];
    }

    /** Base class for all things common between Model and Collection. */
    export abstract class Base {
        static readonly REQUEST_CONTINUE = RequestOperation.REQUEST_CONTINUE;
        static readonly REQUEST_REDUNDANT = RequestOperation.REQUEST_REDUNDANT;
        static readonly REQUEST_SKIP = RequestOperation.REQUEST_SKIP;
        readonly _uid: string;
        private readonly _listeners;
        private readonly _options;

        protected constructor(options: Options);

        /** @returns {string} The class name of this instance. */
        get $class(): string;

        /**
         * Called after construction, this hook allows you to add some extra setup
         * logic without having to override the constructor.
         */
        boot(): void;

        /**
         * Returns a route configuration in the form {key: name}, where key may be
         * 'save', 'fetch', 'delete' or any other custom key, and the name is what
         * will be passed to the route resolver to generate the URL. See @getURL
         *
         * @returns {Object}
         */
        routes(): Routes;

        /**
         * Returns the default context for all events emitted by this instance.
         *
         * @returns {Object}
         */
        getDefaultEventContext(): {
            target: Base;
        };

        /** @returns {string} Default string representation. */
        toString(): string;

        /**
         * Emits an event by name to all registered listeners on that event.
         *
         * Listeners will be called in the order that they were added. If a listener
         * returns `false`, no other listeners will be called.
         *
         * @param {string} event The name of the event to emit.
         * @param {Object} context The context of the event, passed to listeners.
         */
        emit(event: string, context?: Record<string, any>): void;

        /**
         * Registers an event listener for a given event.
         *
         * Event names can be comma-separated to register multiple events.
         *
         * @param {string} event The name of the event to listen for.
         * @param {function} listener The event listener, accepts context.
         */
        on(event: string, listener: Listener): void;

        /** @returns {Object} Parameters to use for replacement in route patterns. */
        getRouteParameters(): Record<string, string>;

        /** @returns {RegExp | string} Pattern to match and group route parameters. */
        getRouteParameterPattern(): RegExp | string;

        /** @returns {RegExp} The default route parameter pattern. */
        getDefaultRouteParameterPattern(): RegExp;

        /** @returns {Object} This class' default options. */
        getDefaultOptions(): Options;

        /**
         * @param {Array | string} path Option path resolved by `get`
         * @param {any} fallback Fallback value if the option is not set.
         * @returns {any} The value of the given option path.
         */
        getOption(path: string | string[], fallback?: any): any;

        /** @returns {Object} This instance's default options. */
        options(): Options;

        /**
         * Sets an option.
         *
         * @param {string} path
         * @param {any} value
         */
        setOption(path: string, value: any): void;

        /**
         * Sets all given options. Successive values for the same option won't be
         * overwritten, so this follows the 'defaults' behaviour, and not 'merge'.
         *
         * @param {...Object} options One or more objects of options.
         */
        setOptions(...options: Options[]): void;

        /**
         * Returns all the options that are currently set on this instance.
         *
         * @returns {Object}
         */
        getOptions(): Options;

        /**
         * Returns a function that translates a route key and parameters to a URL.
         *
         * @returns {Function} Will be passed `route` and `parameters`
         */
        getRouteResolver(): RouteResolver;

        /** @returns {Object} An object consisting of all route string replacements. */
        getRouteReplacements(
            route: string,
            parameters?: Record<string, string>
        ): Record<string, string>;

        /**
         * Returns the default URL provider, which assumes that route keys are
         * URL's, and parameter replacement syntax is in the form "{param}".
         *
         * @returns {Function}
         */
        getDefaultRouteResolver(): RouteResolver;

        /** @returns {Object} The data to send to the server when saving this model. */
        getDeleteBody(): any;

        /** @returns {Object} Query parameters that will be appended to the `fetch` URL. */
        getFetchQuery(): Record<string, any>;

        /** @returns {Object} Query parameters that will be appended to the `save` URL. */
        getSaveQuery(): Record<string, any>;

        /** @returns {Object} Query parameters that will be appended to the `delete` URL. */
        getDeleteQuery(): Record<string, any>;

        /** @returns {string} The key to use when generating the `fetch` URL. */
        getFetchRoute(): string;

        /** @returns {string} The key to use when generating the `save` URL. */
        getSaveRoute(): string;

        /** @returns {string} The key to use when generating the `delete` URL. */
        getDeleteRoute(): string;

        /** @returns {Object} Headers to use when making any request. */
        getDefaultHeaders(): Record<string, any>;

        /** @returns {Object} Headers to use when making a save request. */
        getSaveHeaders(): Record<string, any>;

        /** @returns {Object} Headers to use when making a fetch request. */
        getFetchHeaders(): Record<string, any>;

        /** @returns {Object} Headers to use when making a delete request. */
        getDeleteHeaders(): Record<string, any>;

        /** @returns {Object} Default HTTP methods. */
        getDefaultMethods(): object;

        /** @returns {string} HTTP method to use when making a save request. */
        getSaveMethod(): Method;

        /** @returns {string} HTTP method to use when making a fetch request. */
        getFetchMethod(): Method;

        /** @returns {string} HTTP method to use when updating a resource. */
        getUpdateMethod(): Method;

        /** @returns {string} HTTP method to use when patching a resource. */
        getPatchMethod(): Method;

        /** @returns {string} HTTP method to use when creating a resource. */
        getCreateMethod(): Method;

        /** @returns {string} HTTP method to use when deleting a resource. */
        getDeleteMethod(): Method;

        /** @returns {number} The HTTP status code that indicates a validation error. */
        getValidationErrorStatus(): number;

        /** @returns {boolean} `true` if the response indicates a validation error. */
        isBackendValidationError(error: RequestError | any): boolean;

        /** @returns {string | undefined} Route value by key. */
        getRoute(key: string, fallback?: string): string;

        /** @returns {string} The full URL to use when making a fetch request. */
        getFetchURL(): string;

        /** @returns {string} The full URL to use when making a save request. */
        getSaveURL(): string;

        /** @returns {string} The full URL to use when making a delete request. */
        getDeleteURL(): string;

        /**
         * @param {string} route The route key to use to generate the URL.
         * @param {Object} parameters Route parameters.
         * @returns {string} A URL that was generated using the given route key.
         */
        getURL(route: string, parameters?: Record<string, any>): string;

        /** @returns {Request} A new `Request` using the given configuration. */
        createRequest(config: AxiosRequestConfig): Request;

        /** Creates a request error based on a given existing error and optional response. */
        createRequestError(error: any, response: Response): RequestError;

        /** Creates a response error based on a given existing error and response. */
        createResponseError(error: any, response?: Response): ResponseError;

        /** Creates a validation error using given errors and an optional message. */
        createValidationError(
            errors: Errors | Errors[],
            message?: string
        ): ValidationError;

        /**
         * This is the central component for all HTTP requests and handling.
         *
         * @param {Object} config Request configuration
         * @param {function} onRequest Called before the request is made.
         * @param {function} onSuccess Called when the request was successful.
         * @param {function} onFailure Called when the request failed.
         */
        request(
            config: AxiosRequestConfig | (() => AxiosRequestConfig),
            onRequest: OnRequestCallback,
            onSuccess: RequestSuccessCallback,
            onFailure: RequestFailureCallback
        ): Promise<Response | null>;

        abstract onFetch(): Promise<RequestOperation>;

        abstract onFetchFailure(error: any, response: Response | undefined): void;

        abstract onFetchSuccess(response: Response | null): void;

        /**
         * Fetches data from the database/API.
         *
         * @param {options} Fetch Options
         * @param {options.method} Fetch HTTP method
         * @param {options.url} Fetch URL
         * @param {options.params} Query Params
         * @param {options.headers} Query Headers
         * @returns {Promise}
         */
        fetch(options?: RequestOptions): Promise<Response | null>;

        abstract getSaveData(): Record<any, any>;

        abstract onSave(): Promise<RequestOperation>;

        abstract onSaveFailure(error: any, response: Response | undefined): void;

        abstract onSaveSuccess(response: BaseResponse | null): void;

        /**
         * Persists data to the database/API.
         *
         * @param {options} Save Options
         * @param {options.method} Save HTTP method
         * @param {options.url} Save URL
         * @param {options.data} Save Data
         * @param {options.params} Query Params
         * @param {options.headers} Query Headers
         * @returns {Promise}
         */
        save(options?: RequestOptions): Promise<Response | null>;

        /**
         * Converts given data to FormData for uploading.
         *
         * @param {Object} data
         * @returns {FormData}
         */
        convertObjectToFormData(data: Record<string, string | Blob>): FormData;

        /**
         * Persists data to the database/API using FormData.
         *
         * @param {options} Save Options
         * @param {options.method} Save HTTP method
         * @param {options.url} Save URL
         * @param {options.params} Query Params
         * @param {options.headers} Query Headers
         * @returns {Promise}
         */
        upload(options?: Record<any, any>): Promise<Response | null>;

        abstract onDelete(): Promise<RequestOperation>;

        abstract onDeleteFailure(error: any, response: Response | undefined): void;

        abstract onDeleteSuccess(response: Response | null): void;

        /**
         * Removes model or collection data from the database/API.
         *
         * @param {options} Delete Options
         * @param {options.method} Delete HTTP method
         * @param {options.url} Delete URL
         * @param {options.params} Query Params
         * @param {options.headers} Query Headers
         * @returns {Promise}
         */
        delete(options?: RequestOptions): Promise<Response | null>;
    }

    export type Predicate<T = boolean> =
        | ((model: Model) => T)
        | string
        | Record<string, any>
        | Model
        | Partial<Model>;

    interface ModelOptions extends Options {
        methods?: Partial<Record<string, HttpMethods>>;
        /** The attribute that should be used to uniquely identify this model. */
        identifier?: string;
        /** Whether this model should allow an existing identifier to be overwritten on update. */
        overwriteIdentifier?: boolean;
        /** Route parameter matching pattern. */
        routeParameterPattern?: RegExp;
        /**
         * Whether this model should perform a "patch" on update, which will only
         * send changed attributes in the request.
         */
        patch?: boolean;
        /**
         * Whether this model should save even if no attributes have changed since
         * the last time they were synced. If set to `false` and no changes have
         * been made, the request will be considered a success.
         */
        saveUnchanged?: boolean;
        /**
         * Whether this model should only use the first validation error it
         * receives, rather than an array of errors.
         */
        useFirstErrorOnly?: boolean;
        /**
         * Whether this model should validate an attribute that has changed. This
         * would only affect the errors of the changed attribute and will only be
         * applied if the value is not a blank string.
         */
        validateOnChange?: boolean;
        /**
         * Whether this model should be validated before it is saved. This will
         * cause the request to fail if validation does not pass. This is useful
         * when you only want to validate on demand.
         */
        validateOnSave?: boolean;
        /**
         * Whether this model should validate models and collections within its
         * attribute tree. The result is implicit recursion as each of those
         * instances will also validate their trees, etc.
         */
        validateRecursively?: boolean;
        /**
         * Whether this model should mutate a property as it is changed, before it
         * is set. This is a rare requirement because you usually don't want to
         * mutate something that you are busy editing.
         */
        mutateOnChange?: boolean;
        /**
         * Whether this model should mutate all attributes before they are synced to
         * the "saved" state. This would include construction, on fetch, on save,
         * and on assign.
         */
        mutateBeforeSync?: boolean;
        /**
         * Whether this model should use mutated values for the attributes in "save"
         * request. This will not mutate the active state.
         */
        mutateBeforeSave?: boolean;

        [key: string]: any;
    }

    export type Mutation = (value: any) => any;

    export type ValidationTask = true | string | Promise<ValidationResult>;

    export type ValidationResult =
        | true
        | string
        | AttributesValidationErrors
        | (string | AttributesValidationErrors)[];

    export type ValidationResultError = string | AttributesValidationErrors;

    export type ValidationResultErrorFinalResult =
        | ValidationResultError
        | ValidationResultError[];

    export interface AttributesValidationErrors {
        [key: string]: ValidationResultErrorFinalResult;
    }

    export interface BaseResponse {
        getData(): unknown;

        getStatus(): number;

        getHeaders(): unknown;

        getValidationErrors(): unknown;
    }

    export class ProxyResponse<T = Record<string, any>> {
        data: T;
        headers: Record<string, any>;
        status: number;

        constructor(status: number, data?: T, headers?: Record<string, any>);

        getData(): T;

        getStatus(): number;

        getHeaders(): Record<string, any>;

        getValidationErrors(): Record<string, any>;
    }

    export class Response<T = any | null | Record<string, any>> {
        response?: AxiosResponse;

        constructor(response?: AxiosResponse);

        getData(): T;

        getStatus(): number;

        getHeaders(): any;

        getValidationErrors(): Record<string, any> | null;
    }

    export class Request {
        config: AxiosRequestConfig;

        constructor(config: AxiosRequestConfig);

        /** Creates a custom response using a given Axios response. */
        createResponse(axiosResponse?: AxiosResponse): Response;

        /** Creates a custom response error using a given Axios response error. */
        createError(axiosError: AxiosError): RequestError;

        /** @returns {Promise} */
        send(): Promise<Response>;
    }

    export class RequestError {
        message: string;
        error: any;
        response: Response;
        stack?: string;

        constructor(error: any, response: Response);

        toString(): string;

        getError(): any;

        getResponse(): Response;
    }

    export class ResponseError {
        message: string;
        response?: Response;
        stack?: string;

        constructor(message: string, response?: Response);

        toString(): string;

        getResponse(): Response | undefined;
    }

    export class ValidationError {
        message: string;
        errors: Errors | Errors[];
        stack?: string;

        constructor(errors: Errors | Errors[], message?: string);

        toString(): string;

        getValidationErrors(): Errors | Errors[];
    }

    export type Errors = Record<string, string | string[]>;

    export interface Options {
        model?: typeof Model;
        methods?: Partial<Record<RequestType, HttpMethods>>;
        routeParameterPattern?: RegExp;
        useDeleteBody?: boolean;

        [key: string]: any;
    }

    export type Routes = Record<'fetch' | 'save' | 'delete' | string, string>;

    export type Listener = (context: Record<string, any>) => void;

    export type RouteResolver = (
        route: string,
        parameters: Record<string, string>
    ) => string;

    export type RequestFailureCallback = (
        error: any,
        response: Response | undefined
    ) => void;

    export type RequestSuccessCallback = (response: Response | null) => void;

    export type OnRequestCallback = () => Promise<number | boolean>;

    export type HttpMethods =
        | 'GET'
        | 'POST'
        | 'PATCH'
        | 'PUT'
        | 'DELETE'
        | string;

    export type RequestType =
        | 'fetch'
        | 'save'
        | 'update'
        | 'create'
        | 'patch'
        | 'delete'
        | string;

    export interface RequestOptions {
        url?: string;
        method?: Method;
        data?: any;
        params?: Record<string, any>;
        headers?: Record<string, any>;
    }

    export enum RequestOperation {
        REQUEST_CONTINUE = 0,
        REQUEST_REDUNDANT = 1,
        REQUEST_SKIP = 2,
    }
}

declare module '@planetadeleste/vuemc/validation' {
    import { Model } from '@planetadeleste/vuemc';

    class GlobalMessages {
        $locale: string;
        $fallback: string;
        $locales: Record<string, Bundle>;

        constructor();

        /** Resets everything to the default configuration. */
        reset(): void;

        /**
         * Sets the active locale.
         *
         * @param {string} locale
         */
        locale(locale: string): void;

        /** Registers a language pack. */
        register(bundle: Bundle): void;

        /**
         * Replaces or adds a new message for a given name and optional locale.
         *
         * @param {string} name
         * @param {string} format
         * @param {string} locale
         */
        set(name: string, format: string, locale: string): void;

        /**
         * Returns a formatted string for a given message name and context data.
         *
         * @param {string} name
         * @param {Object} data
         * @returns {string} The formatted message.
         */
        get(name: string, data?: Record<string, any>): string;
    }

    /** Global validation message registry. */
    export const messages: GlobalMessages;
    /**
     * Rule helpers for easy validation. These can all be used directly in a
     * model's validation configuration.
     *
     * @example
     *   import { ascii, length } from 'vue-mc/validation';
     *
     *   class User extends Model {
     *     validation() {
     *       return {
     *         password: ascii.and(length(6)),
     *       };
     *     }
     *   }
     */
    /**
     * Creates a new validation rule.
     *
     * Rules returned by this function can be chained with `or` and `and`. For
     * example: `ruleA.or(ruleB.and(RuleC)).and(RuleD)`
     *
     * The error message can be set or replaced using `format(message|template)`.
     *
     * @param {Object} config: - Name: Name of the error message. - data: Context
     *   for the error message. - test: Function accepting (value, model), which
     *   should return `true` if the value is valid.
     * @returns {Function} Validation rule.
     */
    export const rule: RuleFunction;
    /** AVAILABLE RULES */
    /** Checks if the value is after a given date string or `Date` object. */
    export const after: (date: Date) => Rule;
    /** Checks if a value only has letters. */
    export const alpha: Rule;
    /** Checks if a value only has letters or numbers. */
    export const alphanumeric: Rule;
    /** Checks if a value is an array. */
    export const array: Rule;
    /** Checks if a value is a string consisting only of ASCII characters. */
    export const ascii: Rule;
    /** Checks if a value is a valid Base64 string. */
    export const base64: Rule;
    /** Checks if a value is before a given date string or `Date` object. */
    export const before: (date: Date) => Rule;
    /** Checks if a value is between a given minimum or maximum, inclusive by default. */
    export const between: RuleFunction;
    /** Checks if a value is a boolean (strictly true or false). */
    export const boolean: Rule;
    /** Checks if a value is a valid credit card number. */
    export const creditcard: Rule;
    /** Checks if a value is parseable as a date. */
    export const date: Rule;
    /**
     * Checks if a value matches the given date format.
     *
     * @see https://date-fns.org/v2.0.0-alpha.9/docs/format
     */
    export const dateformat: RuleFunction;
    /** Checks if a value is not `undefined` */
    export const defined: Rule;
    /** Checks if a value is a valid email address. */
    export const email: Rule;
    /**
     * Checks if value is considered empty.
     *
     * @see https://lodash.com/docs/#isEmpty
     */
    export const empty: Rule;
    /** Checks if a value equals the given value. */
    export const equals: RuleFunction;
    /** Alias for `equals` */
    export const equal: RuleFunction;
    /** Checks if a value is greater than a given minimum. */
    export const gt: RuleFunction;
    /** Checks if a value is greater than or equal to a given minimum. */
    export const gte: RuleFunction;
    /** Checks if a value is an integer. */
    export const integer: Rule;
    /** Checks if a value is a valid IP address. */
    export const ip: Rule;
    /** Checks if a value is a zero-length string. */
    export const isblank: Rule;
    /** Checks if a value is `null` or `undefined`. */
    export const isnil: Rule;
    /** Checks if a value is `null`. */
    export const isnull: Rule;
    /** Checks if a value is a valid ISO8601 date string. */
    export const iso8601: Rule;
    /** Checks if a value is valid JSON. */
    export const json: Rule;
    /**
     * Checks if a value's length is at least a given minimum, and no more than an
     * optional maximum.
     *
     * @see https://lodash.com/docs/#toLength
     */
    export const length: RuleFunction;
    /** Checks if a value is less than a given maximum. */
    export const lt: RuleFunction;
    /** Checks if a value is less than or equal to a given maximum. */
    export const lte: RuleFunction;
    /** Checks if a value matches a given regular expression string or RegExp. */
    export const match: RuleFunction;
    /** Alias for `lte`. */
    export const max: RuleFunction;
    /** Alias for `gte`. */
    export const min: RuleFunction;
    /** Checks if a value is negative. */
    export const negative: Rule;
    export const not: RuleFunction;
    /** Checks if a value is a number (integer or float), excluding `NaN`. */
    export const number: Rule;
    /** Checks if a value is a number or numeric string, excluding `NaN`. */
    export const numeric: Rule;
    /** Checks if a value is an object, excluding arrays and functions. */
    export const object: Rule;
    /** Checks if a value is positive. */
    export const positive: Rule;
    /** Checks if a value is present, ie. not `null`, `undefined`, or a blank string. */
    export const required: Rule;
    /** Checks if a value equals another attribute's value. */
    export const same: RuleFunction;
    /** Checks if a value is a string. */
    export const string: Rule;
    /** Checks if a value is a valid URL string. */
    export const url: Rule;
    /** Checks if a value is a valid UUID. */
    export const uuid: Rule;

    export interface Rule {
        _and: Rule[];
        _or: Rule[];
        _format: string | _.TemplateExecutor | null;

        (value: any, attribute?: string, model?: Model): true | string;

        copy(): Rule;

        format(format: string | _.TemplateExecutor): Rule;

        and(rule: Rule | Rule[]): Rule;

        or(rule: Rule | Rule[]): Rule;
    }

    type RuleFunction = (...params: any[]) => Rule;
    export {};

    /** Afrikaans */
    export const af_za: Bundle;
    /** Arabic - Republic of Iraq */
    export const ar_iq: Bundle;
    /** English - United States (Default) */
    export const en_us: Bundle;
    /** Persian - Islamic Republic of Iran */
    export const fa_ir: Bundle;
    /** French */
    export const fr_fr: Bundle;
    /** Portuguese - Brazil */
    export const pt_br: Bundle;
    /** Dutch - The Netherlands */
    export const nl_nl: Bundle;
    /** Polish - Poland */
    export const pl_pl: Bundle;
    /** Russian - Russia */
    export const ru_ru: Bundle;
    /** Danish - Denmark */
    export const da_dk: Bundle;
    /** Indonesian - Indonesia */
    export const id_id: Bundle;
    /** German - Germany */
    export const de_de: Bundle;
    /** Español - Latinoamérica */
    export const es_es: Bundle;

    export interface Bundle {
        locale: string;
        messages: Messages;
    }

    export interface Messages {
        after: string;
        alpha: string;
        alphanumeric: string;
        array: string;
        ascii: string;
        base64: string;
        before: string;
        between: string;
        between_inclusive: string;
        boolean: string;
        creditcard: string;
        date: string;
        dateformat: string;
        defined: string;
        email: string;
        empty: string;
        equals: string;
        gt: string;
        gte: string;
        integer: string;
        ip: string;
        isblank: string;
        isnil: string;
        isnull: string;
        iso8601: string;
        json: string;
        length: string;
        length_between: string;
        lt: string;
        lte: string;
        match: string;
        negative: string;
        not: string;
        number: string;
        numeric: string;
        object: string;
        positive: string;
        required: string;
        same: string;
        string: string;
        url: string;
        uuid: string;

        [key: string]: string;
    }
}
