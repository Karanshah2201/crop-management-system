def calculate_fertilizer(ideal_n, ideal_p, ideal_k, current_n, current_p, current_k, farm_size, unit):
    """
    Calculates exact kg of Urea, DAP, and MOP needed.
    """
    # 1. Standardize Area to Hectares
    if unit.lower() == 'acre':
        size_in_hectares = farm_size * 0.4047
    elif unit.lower() == 'guntha':
         size_in_hectares = farm_size * 0.0101
    else:
        size_in_hectares = farm_size

    # 2. Calculate Deficit per Hectare (Prevent negatives)
    # If soil has 50 N but needs 120 N, Deficit is 70.
    n_deficit = max(0, ideal_n - current_n)
    p_deficit = max(0, ideal_p - current_p)
    k_deficit = max(0, ideal_k - current_k)

    # 3. Calculate Product Quantities (Smart Formula)
    # ---------------------------------------------------------
    # Rule 1: Calculate Phosphorus (P) uses DAP first.
    # DAP contains 46% P and 18% N.
    
    # Needs:
    p_needed = p_deficit
    
    # 3a. Calculate DAP
    # DAP is 46% Phosphorus
    dap_kg = (p_needed / 0.46) * size_in_hectares
    
    # 3b. Nitrogen Credit from DAP
    # Since we are adding DAP, we are automatically adding some Nitrogen.
    # We must subtract this from the Total Nitrogen needed to avoid over-fertilizing.
    n_supplied_by_dap = dap_kg * 0.18
    
    # 3c. Calculate Urea
    # Total N Needed - N already given by DAP
    # Urea is 46% Nitrogen
    n_remaining_deficit = max(0, n_deficit * size_in_hectares - n_supplied_by_dap)
    urea_kg = n_remaining_deficit / 0.46
    
    # 3d. Calculate MOP
    # MOP is 60% Potassium
    mop_kg = (k_deficit / 0.60) * size_in_hectares

    # 4. Foliar Spray Schedule (Standard General Recommendation)
    spray_schedule = [
        {
            "stage": "Vegetative Growth (Day 20-25)",
            "name": "NPK 19:19:19 (Starter)",
            "dosage": "5-6 gm per liter",
            "purpose": "Boosts initial root and leaf development."
        },
        {
            "stage": "Flowering Stage (Day 40-50)",
            "name": "NPK 0:52:34 (Mono Potassium Phosphate)",
            "dosage": "5-6 gm per liter",
            "purpose": "Promotes flowering and prevents flower drop."
        },
        {
            "stage": "Fruiting / Pod Formation (Day 60-70)",
            "name": "NPK 13:0:45 (Potassium Nitrate)",
            "dosage": "8-10 gm per liter",
            "purpose": "Improves fruit weight, quality, and shine."
        }
    ]

    return {
        "urea": round(urea_kg, 2),
        "dap": round(dap_kg, 2),
        "mop": round(mop_kg, 2),
        "size_in_hectares": round(size_in_hectares, 2),
        "sprays": spray_schedule
    }