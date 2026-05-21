module pulsar::launchpad {
    // ═══════════════════════════════════════════════════════════════
    // IMPORTS — Sui framework 2024 edition
    // ═══════════════════════════════════════════════════════════════
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::package;
    use sui::display;
    use std::string::{Self, String};
    use std::vector;

    // ═══════════════════════════════════════════════════════════════
    // ONE-TIME WITNESS — for Publisher + Display
    // ═══════════════════════════════════════════════════════════════
    public struct LAUNCHPAD has drop {}

    // ═══════════════════════════════════════════════════════════════
    // CORE STRUCTS
    // ═══════════════════════════════════════════════════════════════

    /// Shared config object — controls the collection
    public struct CollectionConfig has key {
        id: UID,
        name: String,
        description: String,
        mint_price: u64,          // in MIST (1 SUI = 1_000_000_000 MIST)
        max_supply: u64,
        current_supply: u64,
        treasury: Balance<SUI>,
        admin: address,
        is_active: bool,
    }

    /// Admin capability — only admin can withdraw or pause
    public struct AdminCap has key, store {
        id: UID,
        collection_id: ID,
    }

    /// The NFT object itself — owned by minter
    public struct PulsarNFT has key, store {
        id: UID,
        number: u64,
        name: String,
        description: String,
        image_url: String,         // Walrus aggregator URL
        blob_id: String,           // Raw Walrus blob_id from Krilly Sponsor SDK
        sponsored_blob_id: String, // sponsored_blob_id from Krilly response
        creator: address,
    }

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════
    const ENotAdmin: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ECollectionSoldOut: u64 = 2;
    const ECollectionNotActive: u64 = 3;
    const EEmptyBlobId: u64 = 4;

    // ═══════════════════════════════════════════════════════════════
    // INIT — runs once at deploy time
    // ═══════════════════════════════════════════════════════════════
    fun init(witness: LAUNCHPAD, ctx: &mut TxContext) {
        // Create Publisher for Display standard
        let publisher = package::claim(witness, ctx);

        // Set up the Object Display standard (Sui Display)
        let mut display_obj = display::new<PulsarNFT>(&publisher, ctx);
        display::add(&mut display_obj, string::utf8(b"name"), string::utf8(b"{name} #{number}"));
        display::add(&mut display_obj, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display_obj, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut display_obj, string::utf8(b"creator"), string::utf8(b"{creator}"));
        display::add(&mut display_obj, string::utf8(b"project_url"), string::utf8(b"https://pulsar.sui"));
        display::update_version(&mut display_obj);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display_obj, tx_context::sender(ctx));

        // Create collection config as a shared object
        let config = CollectionConfig {
            id: object::new(ctx),
            name: string::utf8(b"PULSAR"),
            description: string::utf8(b"Pulsar cosmic art — rotating neutron stars stored on Walrus decentralized storage"),
            mint_price: 100_000, // 0.0001 SUI = 100_000 MIST
            max_supply: 31,
            current_supply: 0,
            treasury: balance::zero<SUI>(),
            admin: tx_context::sender(ctx),
            is_active: true,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
            collection_id: object::id(&config),
        };

        transfer::share_object(config);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ═══════════════════════════════════════════════════════════════
    // MINT — public entry, anyone can call
    // ═══════════════════════════════════════════════════════════════
    public entry fun mint_nft(
        config: &mut CollectionConfig,
        payment: Coin<SUI>,
        nft_name: vector<u8>,
        nft_description: vector<u8>,
        blob_id: vector<u8>,
        sponsored_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Guards
        assert!(config.is_active, ECollectionNotActive);
        assert!(config.current_supply < config.max_supply, ECollectionSoldOut);
        assert!(coin::value(&payment) >= config.mint_price, EInsufficientPayment);
        assert!(vector::length(&blob_id) > 0, EEmptyBlobId);

        // Build the Walrus aggregator URL from blob_id
        let mut image_url = string::utf8(b"https://aggregator.walrus.space/v1/");
        string::append(&mut image_url, string::utf8(blob_id));

        // Increment supply first
        config.current_supply = config.current_supply + 1;

        // Accept exact mint price, refund overpayment if any
        let mut payment_balance = coin::into_balance(payment);
        let mint_balance = balance::split(&mut payment_balance, config.mint_price);
        balance::join(&mut config.treasury, mint_balance);

        // Return any excess SUI to minter
        if (balance::value(&payment_balance) > 0) {
            transfer::public_transfer(
                coin::from_balance(payment_balance, ctx),
                tx_context::sender(ctx)
            );
        } else {
            balance::destroy_zero(payment_balance);
        };

        // Mint the NFT
        let nft = PulsarNFT {
            id: object::new(ctx),
            number: config.current_supply,
            name: string::utf8(nft_name),
            description: string::utf8(nft_description),
            image_url,
            blob_id: string::utf8(blob_id),
            sponsored_blob_id: string::utf8(sponsored_blob_id),
            creator: tx_context::sender(ctx),
        };

        transfer::transfer(nft, tx_context::sender(ctx));
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /// Admin withdraws treasury funds
    public entry fun admin_withdraw(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        ctx: &mut TxContext
    ) {
        let amount = balance::value(&config.treasury);
        if (amount > 0) {
            let withdrawn = balance::split(&mut config.treasury, amount);
            transfer::public_transfer(
                coin::from_balance(withdrawn, ctx),
                config.admin
            );
        }
    }

    /// Admin toggles collection active/paused
    public entry fun set_active(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        active: bool,
    ) {
        config.is_active = active;
    }

    /// Admin updates mint price
    public entry fun set_mint_price(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        new_price: u64,
    ) {
        config.mint_price = new_price;
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (pure reads)
    // ═══════════════════════════════════════════════════════════════
    public fun get_supply(config: &CollectionConfig): (u64, u64) {
        (config.current_supply, config.max_supply)
    }

    public fun get_mint_price(config: &CollectionConfig): u64 {
        config.mint_price
    }

    public fun is_active(config: &CollectionConfig): bool {
        config.is_active
    }
}
